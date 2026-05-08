'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, Loader2, MapPin, ExternalLink } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import type { SavedProfile, Profile } from '@/types/database';
import Link from 'next/link';

export default function SavedProfilesPage() {
  const { user } = useAuthStore();
  const [saved, setSaved] = useState<(SavedProfile & { student: Profile })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSaved(); }, [user]);

  const fetchSaved = async () => {
    if (!user) return;
    const supabase = createClient();
    const { data } = await supabase.from('saved_profiles')
      .select('*, student:student_id(*)')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });
    setSaved((data as unknown as (SavedProfile & { student: Profile })[]) || []);
    setLoading(false);
  };

  const removeSaved = async (studentId: string) => {
    if (!user) return;
    const supabase = createClient();
    await supabase.from('saved_profiles').delete().eq('client_id', user.id).eq('student_id', studentId);
    setSaved(prev => prev.filter(s => s.student_id !== studentId));
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Saved Profiles</h1>
        <p className="text-muted-foreground mt-1">Your favorited student profiles for quick access.</p>
      </div>

      {saved.length === 0 ? (
        <div className="bg-white border border-border shadow-sm rounded-2xl p-12 text-center border-dashed border-2">
          <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">No saved profiles</h3>
          <p className="text-muted-foreground mb-6">Browse students and save your favorites.</p>
          <Link href="/explore"><Button className="bg-primary hover:bg-primary/90 text-white font-semibold">Explore Students</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {saved.map(({ student }) => (
            <div key={student.id} className="bg-white border border-border shadow-sm rounded-xl p-5 group relative hover:shadow-md transition-all">
              <button onClick={() => removeSaved(student.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-400">
                <Heart className="w-4 h-4 fill-current" />
              </button>
              <Link href={`/profile/${student.username}`}>
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-11 h-11">
                    <AvatarImage src={student.avatar_url || ''} />
                    <AvatarFallback className="bg-primary text-xs text-white">
                      {getInitials(student.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold truncate text-foreground">{student.full_name}</h3>
                    <p className="text-xs text-muted-foreground">@{student.username}</p>
                  </div>
                </div>
                {student.bio && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{student.bio}</p>}
                <div className="flex flex-wrap gap-1 mb-3">
                  {student.skills?.slice(0, 3).map(s => (
                    <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                  {student.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{student.location}</span>}
                  {student.hourly_rate > 0 && <span className="text-primary font-semibold">${student.hourly_rate}/hr</span>}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
