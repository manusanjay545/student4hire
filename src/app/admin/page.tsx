'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Users, Shield, Star, Briefcase, Search, Ban, CheckCircle, Loader2, Trash2 } from 'lucide-react';
import { getInitials, formatDate } from '@/lib/utils';
import type { Profile } from '@/types/database';
import Link from 'next/link';

export default function AdminPage() {
  const { profile } = useAuthStore();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, students: 0, clients: 0, verified: 0 });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100);
    const all = (data as Profile[]) || [];
    setUsers(all);
    setStats({
      total: all.length,
      students: all.filter(u => u.role === 'student').length,
      clients: all.filter(u => u.role === 'client').length,
      verified: all.filter(u => u.verified).length,
    });
    setLoading(false);
  };

  const toggleVerified = async (userId: string, current: boolean) => {
    const supabase = createClient();
    await supabase.from('profiles').update({ verified: !current }).eq('id', userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, verified: !current } : u));
  };

  const toggleFeatured = async (userId: string, current: boolean) => {
    const supabase = createClient();
    await supabase.from('profiles').update({ featured: !current }).eq('id', userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, featured: !current } : u));
  };

  const filtered = search
    ? users.filter(u => u.full_name.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase()) || u.role.includes(search.toLowerCase()))
    : users;

  if (profile?.role !== 'admin') {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <Shield className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You don&apos;t have admin privileges.</p>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground mt-1">Manage users, moderation, and platform health.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Users', value: stats.total, icon: Users, color: 'text-violet-400' },
          { title: 'Students', value: stats.students, icon: Star, color: 'text-cyan-400' },
          { title: 'Clients', value: stats.clients, icon: Briefcase, color: 'text-pink-400' },
          { title: 'Verified', value: stats.verified, icon: CheckCircle, color: 'text-green-400' },
        ].map(s => (
          <Card key={s.title} className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className="text-2xl font-bold">{s.value}</div>
              <p className="text-xs text-muted-foreground">{s.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="pl-9 bg-white/5 border-white/10" />
          </div>
        </div>

        <div className="glass-card rounded-xl overflow-hidden border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 text-muted-foreground font-medium">User</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Role</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Joined</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <Link href={`/profile/${u.username}`} className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={u.avatar_url || ''} />
                          <AvatarFallback className="bg-gradient-to-br from-violet-600 to-cyan-600 text-[10px] text-white">
                            {getInitials(u.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{u.full_name}</p>
                          <p className="text-xs text-muted-foreground">@{u.username}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="p-4"><Badge variant="secondary" className="capitalize text-xs">{u.role}</Badge></td>
                    <td className="p-4 text-muted-foreground text-xs">{formatDate(u.created_at)}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {u.verified && <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">Verified</Badge>}
                        {u.featured && <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-[10px]">Featured</Badge>}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => toggleVerified(u.id, u.verified)}>
                          {u.verified ? 'Unverify' : 'Verify'}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => toggleFeatured(u.id, u.featured)}>
                          {u.featured ? 'Unfeature' : 'Feature'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
