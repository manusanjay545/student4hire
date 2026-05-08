'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/stores/auth-store';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Briefcase, Loader2, Clock, CheckCircle, XCircle, MessageSquare,
  DollarSign, ArrowRight,
} from 'lucide-react';
import { getInitials, formatRelativeTime, formatDate } from '@/lib/utils';
import type { HireRequest, Profile, ClientProject } from '@/types/database';
import Link from 'next/link';

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  accepted: 'bg-green-500/10 text-green-600 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
  completed: 'bg-primary/10 text-primary border-primary/20',
};

const statusIcons: Record<string, typeof Clock> = {
  pending: Clock,
  accepted: CheckCircle,
  rejected: XCircle,
  completed: CheckCircle,
};

export default function HireRequestsPage() {
  const { user, profile } = useAuthStore();
  const [requests, setRequests] = useState<(HireRequest & { client: Profile; student: Profile; project?: ClientProject })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<(HireRequest & { client: Profile; student: Profile; project?: ClientProject }) | null>(null);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;
    const supabase = createClient();

    // Fetch based on role
    const column = profile?.role === 'client' ? 'client_id' : 'student_id';
    const { data } = await supabase
      .from('hire_requests')
      .select('*, client:client_id(*), student:student_id(*), project:project_id(*)')
      .eq(column, user.id)
      .order('created_at', { ascending: false });

    setRequests((data as unknown as typeof requests) || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: 'accepted' | 'rejected' | 'completed') => {
    setResponding(true);
    const supabase = createClient();
    await supabase.from('hire_requests').update({ status }).eq('id', id);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));

    // Create notification for the other party
    const req = requests.find(r => r.id === id);
    if (req) {
      const notifyUserId = profile?.role === 'student' ? req.client_id : req.student_id;
      const actionText = status === 'accepted' ? 'accepted' : status === 'rejected' ? 'declined' : 'marked as completed';
      await supabase.from('notifications').insert({
        user_id: notifyUserId,
        type: 'hire',
        title: `Hire request ${actionText}`,
        content: `${profile?.full_name} has ${actionText} your hire request.`,
        link: '/dashboard/requests',
      });
    }

    setSelectedRequest(null);
    setResponding(false);
  };

  // Create a conversation and navigate to messages
  const startConversation = async (otherUserId: string) => {
    if (!user) return;
    const supabase = createClient();

    // Check if conversation exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant_1.eq.${user.id},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${user.id})`)
      .single();

    if (!existing) {
      await supabase.from('conversations').insert({
        participant_1: user.id,
        participant_2: otherUserId,
      });
    }

    window.location.href = '/dashboard/messages';
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hire Requests</h1>
          <p className="text-muted-foreground mt-1">
            {profile?.role === 'student'
              ? 'Manage incoming hire requests from clients.'
              : 'Track your sent hire requests to students.'}
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
            {pendingCount} Pending
          </Badge>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['all', 'pending', 'accepted', 'rejected', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              filter === f
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent'
            }`}
          >
            {f === 'all' ? `All (${requests.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${requests.filter(r => r.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-border shadow-sm rounded-2xl p-12 text-center border-dashed border-2">
          <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">No hire requests</h3>
          <p className="text-muted-foreground mb-6">
            {filter === 'all'
              ? (profile?.role === 'student' ? 'You haven\'t received any hire requests yet.' : 'You haven\'t sent any hire requests yet.')
              : `No ${filter} requests found.`}
          </p>
          {profile?.role === 'client' && (
            <Link href="/explore">
              <Button className="bg-primary hover:bg-primary/90 text-white font-semibold border-0">
                Browse Students
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req, i) => {
            const otherPerson = profile?.role === 'student' ? req.client : req.student;
            const StatusIcon = statusIcons[req.status] || Clock;

            return (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div
                  className="bg-white border border-border shadow-sm rounded-xl p-5 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => setSelectedRequest(req)}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar className="w-11 h-11 shrink-0">
                      <AvatarImage src={otherPerson?.avatar_url || ''} />
                      <AvatarFallback className="bg-primary text-xs text-white">
                        {getInitials(otherPerson?.full_name || 'U')}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-sm text-foreground">{otherPerson?.full_name}</h3>
                        <Badge className={`${statusStyles[req.status]} text-[10px]`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {req.status}
                        </Badge>
                      </div>

                      {req.project && (
                        <p className="text-xs text-primary font-semibold mb-1 flex items-center gap-1">
                          <Briefcase className="w-3 h-3" /> {req.project.title}
                        </p>
                      )}

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{req.message}</p>

                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                        <span>{formatRelativeTime(req.created_at)}</span>
                        {req.budget > 0 && (
                          <span className="flex items-center gap-0.5 text-green-600 font-semibold">
                            <DollarSign className="w-3 h-3" />${req.budget}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-2" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="bg-white border-border shadow-lg sm:max-w-[500px]">
          {selectedRequest && (() => {
            const otherPerson = profile?.role === 'student' ? selectedRequest.client : selectedRequest.student;
            const StatusIcon = statusIcons[selectedRequest.status] || Clock;

            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-lg text-foreground">Hire Request Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-5 mt-2">
                  {/* From/To */}
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={otherPerson?.avatar_url || ''} />
                      <AvatarFallback className="bg-primary text-sm text-white">
                        {getInitials(otherPerson?.full_name || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{otherPerson?.full_name}</p>
                      <p className="text-xs text-muted-foreground">@{otherPerson?.username} • {profile?.role === 'student' ? 'Client' : 'Student'}</p>
                    </div>
                    <Badge className={`${statusStyles[selectedRequest.status]} ml-auto`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {selectedRequest.status}
                    </Badge>
                  </div>

                  {/* Project */}
                  {selectedRequest.project && (
                    <div className="bg-muted border border-border rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Related Project</p>
                      <p className="text-sm font-medium text-foreground">{selectedRequest.project.title}</p>
                      {selectedRequest.project.budget > 0 && (
                        <p className="text-xs text-primary font-semibold mt-1">${selectedRequest.project.budget} budget</p>
                      )}
                    </div>
                  )}

                  {/* Message */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Message</p>
                    <div className="bg-muted border border-border rounded-lg p-4 text-sm text-foreground">
                      {selectedRequest.message}
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Sent {formatDate(selectedRequest.created_at)}</span>
                    {selectedRequest.budget > 0 && (
                      <span className="text-green-600 font-semibold">${selectedRequest.budget} offered</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                    {selectedRequest.status === 'pending' && profile?.role === 'student' && (
                      <>
                        <Button
                          onClick={() => updateStatus(selectedRequest.id, 'accepted')}
                          disabled={responding}
                          className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold gap-2"
                        >
                          <CheckCircle className="w-4 h-4" /> Accept
                        </Button>
                        <Button
                          onClick={() => updateStatus(selectedRequest.id, 'rejected')}
                          disabled={responding}
                          variant="outline"
                          className="flex-1 border-red-500/20 text-red-400 hover:bg-red-500/10 gap-2"
                        >
                          <XCircle className="w-4 h-4" /> Decline
                        </Button>
                      </>
                    )}

                    {selectedRequest.status === 'accepted' && (
                      <>
                        <Button
                          onClick={() => startConversation(
                            profile?.role === 'student' ? selectedRequest.client_id : selectedRequest.student_id
                          )}
                          className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold gap-2"
                        >
                          <MessageSquare className="w-4 h-4" /> Message
                        </Button>
                        <Button
                          onClick={() => updateStatus(selectedRequest.id, 'completed')}
                          disabled={responding}
                          variant="outline"
                          className="flex-1 border-border bg-white text-foreground hover:bg-muted gap-2"
                        >
                          <CheckCircle className="w-4 h-4" /> Mark Complete
                        </Button>
                      </>
                    )}

                    {(selectedRequest.status === 'rejected' || selectedRequest.status === 'completed') && (
                      <p className="text-sm text-muted-foreground w-full text-center py-2">
                        This request has been {selectedRequest.status}.
                      </p>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
