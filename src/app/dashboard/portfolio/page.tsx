'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/stores/auth-store';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Image as ImageIcon, Trash2, ExternalLink, Loader2, Edit } from 'lucide-react';
import type { PortfolioProject } from '@/types/database';
import { CATEGORIES } from '@/types/database';

export default function PortfolioManager() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [projectLink, setProjectLink] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('portfolio_projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setProjects(data as PortfolioProject[] || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title || !category) return;
    
    setSubmitting(true);
    const supabase = createClient();
    
    let imageUrl = '';
    
    // Upload image if provided
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(fileName, imageFile);
        
      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage
          .from('portfolio')
          .getPublicUrl(fileName);
        imageUrl = publicUrl;
      }
    }

    const projectData = {
      user_id: user.id,
      title,
      description,
      category,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      project_link: projectLink,
      ...(imageUrl && { images: [imageUrl] }),
    };

    if (editingId) {
      await supabase.from('portfolio_projects').update(projectData).eq('id', editingId);
    } else {
      await supabase.from('portfolio_projects').insert(projectData);
    }

    await fetchProjects();
    resetForm();
    setIsDialogOpen(false);
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    const supabase = createClient();
    await supabase.from('portfolio_projects').delete().eq('id', id);
    setProjects(projects.filter(p => p.id !== id));
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setTags('');
    setProjectLink('');
    setImageFile(null);
    setEditingId(null);
  };

  const editProject = (p: PortfolioProject) => {
    setTitle(p.title);
    setDescription(p.description || '');
    setCategory(p.category || '');
    setTags(p.tags?.join(', ') || '');
    setProjectLink(p.project_link || '');
    setEditingId(p.id);
    setIsDialogOpen(true);
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Manager</h1>
          <p className="text-muted-foreground mt-1">Add and manage your portfolio projects to showcase to clients.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger>
            <Button className="bg-primary hover:bg-primary/90 text-white font-semibold gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-border shadow-lg sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">{editingId ? 'Edit Project' : 'Add New Project'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block text-foreground">Project Title *</label>
                <Input required value={title} onChange={(e) => setTitle(e.target.value)} className="bg-white border-border" placeholder="e.g. E-commerce Website Design" />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1.5 block text-foreground">Category *</label>
                <Select required value={category} onValueChange={(v) => setCategory(v ?? '')}>
                  <SelectTrigger className="bg-white border-border">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-border">
                    {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block text-foreground">Image</label>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-muted transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {imageFile ? imageFile.name : 'Click or drag image to upload'}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block text-foreground">Description</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-white border-border min-h-[100px]" placeholder="Describe what you built and your role..." />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block text-foreground">Tags (comma separated)</label>
                <Input value={tags} onChange={(e) => setTags(e.target.value)} className="bg-white border-border" placeholder="React, Tailwind, Node.js" />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block text-foreground">Live Project Link</label>
                <Input type="url" value={projectLink} onChange={(e) => setProjectLink(e.target.value)} className="bg-white border-border" placeholder="https://..." />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-border bg-white text-foreground hover:bg-muted">Cancel</Button>
                <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90 text-white font-semibold">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? 'Save Changes' : 'Publish Project'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white border border-border shadow-sm rounded-2xl p-12 text-center border-dashed border-2">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">No projects yet</h3>
          <p className="text-muted-foreground mb-6">Upload your best work to attract clients.</p>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-white">
            Add Your First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-border shadow-sm rounded-xl overflow-hidden group"
            >
              <div className="aspect-video bg-muted relative">
                {project.images?.[0] ? (
                  <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" onClick={() => editProject(project)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => handleDelete(project.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <div className="text-xs text-primary font-semibold mb-1">{project.category}</div>
                <h3 className="font-semibold truncate mb-2 text-foreground">{project.title}</h3>
                {project.project_link && (
                  <a href={project.project_link} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> View Live
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
