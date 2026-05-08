'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Briefcase, DollarSign, Clock } from 'lucide-react';
import { getInitials, formatDate } from '@/lib/utils';
import type { ClientProject, Profile } from '@/types/database';
import Link from 'next/link';

export default function PublicProjectsPage() {
  const [projects, setProjects] = useState<(ClientProject & { profiles: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      const { data } = await supabase.from('client_projects')
        .select('*, profiles:client_id(*)')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(50);
      setProjects((data as unknown as (ClientProject & { profiles: Profile })[]) || []);
      setLoading(false);
    }
    fetch();
  }, []);

  const filtered = search
    ? projects.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()) || p.skills_required?.some(s => s.toLowerCase().includes(search.toLowerCase())))
    : projects;

  return (
    <div className="min-h-screen pt-4 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Open <span className="gradient-text">Projects</span></h1>
          <p className="text-muted-foreground mb-8">Browse open projects looking for student talent.</p>
        </motion.div>

        <div className="relative mb-8 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects, skills..." className="pl-10 bg-white/5 border-white/10 h-11" />
        </div>

        {loading ? (
          <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-xl">
            <Briefcase className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1">No projects found</h3>
            <p className="text-sm text-muted-foreground">Check back later for new opportunities.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((project, i) => (
              <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card rounded-xl p-6 hover:bg-white/[0.04] transition-all">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.skills_required?.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${project.budget || 'Negotiable'}</span>
                      <span>{project.category}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(project.created_at)}</span>
                    </div>
                  </div>
                  {project.profiles && (
                    <Link href={`/profile/${project.profiles.username}`} className="flex sm:flex-col items-center gap-2 shrink-0 sm:text-center">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={project.profiles.avatar_url || ''} />
                        <AvatarFallback className="bg-gradient-to-br from-violet-600 to-cyan-600 text-xs text-white">
                          {getInitials(project.profiles.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{project.profiles.full_name}</span>
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
