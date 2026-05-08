'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users, Shield, Search, CheckCircle, Loader2, Star, XCircle,
  ChevronLeft, ChevronRight, Filter, UserCheck, UserX, Eye,
} from 'lucide-react';
import { getInitials, formatDate } from '@/lib/utils';
import type { Profile } from '@/types/database';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminUsersPage() {
  const { profile: adminProfile } = useAuthStore();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    setUsers((data as Profile[]) || []);
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

  const toggleAvailable = async (userId: string, current: boolean) => {
    const supabase = createClient();
    await supabase.from('profiles').update({ available: !current }).eq('id', userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, available: !current } : u));
  };

  // Filtering
  let filtered = users;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(u =>
      u.full_name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.role.includes(q) ||
      u.college_name?.toLowerCase().includes(q) ||
      u.location?.toLowerCase().includes(q)
    );
  }
  if (roleFilter !== 'all') filtered = filtered.filter(u => u.role === roleFilter);
  if (statusFilter === 'verified') filtered = filtered.filter(u => u.verified);
  if (statusFilter === 'featured') filtered = filtered.filter(u => u.featured);
  if (statusFilter === 'available') filtered = filtered.filter(u => u.available);
  if (statusFilter === 'unverified') filtered = filtered.filter(u => !u.verified);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const stats = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    clients: users.filter(u => u.role === 'client').length,
    verified: users.filter(u => u.verified).length,
    featured: users.filter(u => u.featured).length,
  };

  if (adminProfile?.role !== 'admin') {
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
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all platform users. {filtered.length} of {users.length} users shown.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: Users, color: 'text-violet-400' },
          { label: 'Students', value: stats.students, icon: Star, color: 'text-cyan-400' },
          { label: 'Clients', value: stats.clients, icon: UserCheck, color: 'text-pink-400' },
          { label: 'Verified', value: stats.verified, icon: CheckCircle, color: 'text-green-400' },
          { label: 'Featured', value: stats.featured, icon: Star, color: 'text-yellow-400' },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className="text-xl font-bold">{s.value}</div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, username, college..."
            className="pl-9 bg-white/5 border-white/10 h-9 text-sm"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v ?? 'all'); setPage(0); }}>
          <SelectTrigger className="w-32 bg-white/5 border-white/10 h-9 text-sm">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent className="glass-strong border-white/10">
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Students</SelectItem>
            <SelectItem value="client">Clients</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v ?? 'all'); setPage(0); }}>
          <SelectTrigger className="w-36 bg-white/5 border-white/10 h-9 text-sm">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="glass-strong border-white/10">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="available">Available</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="glass-card rounded-xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="text-left p-4 text-muted-foreground font-medium text-xs uppercase tracking-wider">User</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-xs uppercase tracking-wider">Role</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-xs uppercase tracking-wider hidden md:table-cell">College</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Joined</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-xs uppercase tracking-wider">Status</th>
                <th className="text-right p-4 text-muted-foreground font-medium text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-3 text-muted-foreground/20" />
                    No users match your filters.
                  </td>
                </tr>
              ) : (
                paginated.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-4">
                      <Link href={`/profile/${u.username}`} className="flex items-center gap-3">
                        <Avatar className="w-9 h-9">
                          <AvatarImage src={u.avatar_url || ''} />
                          <AvatarFallback className="bg-gradient-to-br from-violet-600 to-cyan-600 text-[10px] text-white">
                            {getInitials(u.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{u.full_name}</p>
                          <p className="text-xs text-muted-foreground truncate">@{u.username}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary" className="capitalize text-xs">{u.role}</Badge>
                    </td>
                    <td className="p-4 text-muted-foreground text-xs hidden md:table-cell truncate max-w-[150px]">
                      {u.college_name || '—'}
                    </td>
                    <td className="p-4 text-muted-foreground text-xs hidden sm:table-cell whitespace-nowrap">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {u.verified && (
                          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">
                            Verified
                          </Badge>
                        )}
                        {u.featured && (
                          <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-[10px]">
                            Featured
                          </Badge>
                        )}
                        {u.available && (
                          <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px]">
                            Available
                          </Badge>
                        )}
                        {!u.verified && !u.featured && (
                          <span className="text-xs text-muted-foreground/50">—</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`text-xs h-7 px-2 ${u.verified ? 'text-blue-400 hover:text-blue-300' : 'text-muted-foreground'}`}
                          onClick={() => toggleVerified(u.id, u.verified)}
                          title={u.verified ? 'Remove verification' : 'Verify user'}
                        >
                          {u.verified ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`text-xs h-7 px-2 ${u.featured ? 'text-yellow-400 hover:text-yellow-300' : 'text-muted-foreground'}`}
                          onClick={() => toggleFeatured(u.id, u.featured)}
                          title={u.featured ? 'Remove feature' : 'Feature user'}
                        >
                          <Star className={`w-3.5 h-3.5 ${u.featured ? 'fill-current' : ''}`} />
                        </Button>
                        <Link href={`/profile/${u.username}`}>
                          <Button size="sm" variant="ghost" className="text-xs h-7 px-2 text-muted-foreground" title="View profile">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/5">
            <p className="text-xs text-muted-foreground">
              Page {page + 1} of {totalPages} • {filtered.length} user{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >
                Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
