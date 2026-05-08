'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Briefcase, Loader2, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { ClientProject } from '@/types/database';
import { CATEGORIES, SKILLS } from '@/types/database';

const statusColors: Record<string, string> = {
  open: 'bg-green-500/10 text-green-400 border-green-500/20',
  in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function ProjectsPage() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('');
  const [skillsRequired, setSkillsRequired] = useState<string[]>([]);

  useEffect(() => { fetchProjects(); }, [user]);

  const fetchProjects = async () => {
    if (!user) return;
    const supabase = createClient();
    const { data } = await supabase.from('client_projects')
      .select('*').eq('client_id', user.id).order('created_at', { ascending: false });
    setProjects((data as ClientProject[]) || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title || !category) return;
    setSubmitting(true);
    const supabase = createClient();
    await supabase.from('client_projects').insert({
      client_id: user.id,
      title,
      description,
      budget: parseFloat(budget) || 0,
      category,
      skills_required: skillsRequired,
    });
    await fetchProjects();
    setTitle(''); setDescription(''); setBudget(''); setCategory(''); setSkillsRequired([]);
    setIsOpen(false);
    setSubmitting(false);
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    const supabase = createClient();
    await supabase.from('client_projects').delete().eq('id', id);
    setProjects(projects.filter(p => p.id !== id));
  };

  const toggleSkill = (s: string) => {
    setSkillsRequired(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-muted-foreground mt-1">Post and manage your project listings.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger>
            <Button className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white border-0 gap-2 shadow-lg shadow-violet-500/20">
              <Plus className="w-4 h-4" /> Post Project
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong border-white/10 sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Post a New Project</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div><label className="text-sm font-medium mb-1.5 block">Title *</label>
                <Input required value={title} onChange={e => setTitle(e.target.value)} className="bg-white/5 border-white/10" placeholder="e.g. Build a landing page" /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Description *</label>
                <Textarea required value={description} onChange={e => setDescription(e.target.value)} className="bg-white/5 border-white/10 min-h-[100px]" placeholder="Describe your project in detail..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium mb-1.5 block">Budget (USD)</label>
                  <Input type="number" value={budget} onChange={e => setBudget(e.target.value)} className="bg-white/5 border-white/10" placeholder="500" /></div>
                <div><label className="text-sm font-medium mb-1.5 block">Category *</label>
                  <Select required value={category} onValueChange={(v) => setCategory(v ?? '')}>
                    <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent className="glass-strong border-white/10">
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select></div>
              </div>
              <div><label className="text-sm font-medium mb-1.5 block">Skills Required</label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto scrollbar-thin">
                  {SKILLS.slice(0, 20).map(s => (
                    <button key={s} type="button" onClick={() => toggleSkill(s)}
                      className={`px-2.5 py-1 rounded-md text-xs transition-all ${skillsRequired.includes(s)
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                        : 'bg-white/5 text-muted-foreground border border-white/10'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" className="border-white/10" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white border-0">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post Project'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border-dashed border-2 border-white/10">
          <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold mb-2">No projects posted</h3>
          <p className="text-muted-foreground mb-6">Post your first project to find talented students.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map(project => (
            <div key={project.id} className="glass-card rounded-xl p-5 flex flex-col sm:flex-row gap-4 group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="font-semibold">{project.title}</h3>
                  <Badge className={statusColors[project.status]}>{project.status.replace('_', ' ')}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {project.skills_required?.map(s => (
                    <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{project.category}</span>
                  {project.budget > 0 && <span className="text-violet-400 font-semibold">${project.budget}</span>}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 shrink-0"
                onClick={() => deleteProject(project.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
