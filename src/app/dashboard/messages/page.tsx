'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { createClient } from '@/lib/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, Search, MessageSquare, ArrowLeft } from 'lucide-react';
import { getInitials, formatRelativeTime } from '@/lib/utils';
import type { Profile, Message, Conversation } from '@/types/database';

export default function MessagesPage() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherProfile, setOtherProfile] = useState<Profile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchConversations();
    // Subscribe to new messages via Supabase Realtime
    const supabase = createClient();
    const channel = supabase
      .channel('messages_realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`,
      }, (payload) => {
        const msg = payload.new as Message;
        if (selectedConv) {
          const otherId = selectedConv.participant_1 === user.id ? selectedConv.participant_2 : selectedConv.participant_1;
          if (msg.sender_id === otherId) {
            setMessages(prev => [...prev, msg]);
          }
        }
        fetchConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('conversations')
      .select('*, participant_1_profile:participant_1(id, full_name, avatar_url, username), participant_2_profile:participant_2(id, full_name, avatar_url, username)')
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
      .order('last_message_at', { ascending: false });
    setConversations((data as unknown as Conversation[]) || []);
    setLoading(false);
  };

  const selectConversation = async (conv: Conversation) => {
    if (!user) return;
    setSelectedConv(conv);
    const otherId = conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1;
    const otherProf = conv.participant_1 === user.id ? conv.participant_2_profile : conv.participant_1_profile;
    setOtherProfile(otherProf as unknown as Profile || null);

    const supabase = createClient();
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
    setMessages((data as Message[]) || []);

    // Mark unread messages as read
    await supabase.from('messages').update({ read: true }).eq('receiver_id', user.id).eq('sender_id', otherId).eq('read', false);

    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedConv || !newMessage.trim()) return;
    setSending(true);
    const otherId = selectedConv.participant_1 === user.id ? selectedConv.participant_2 : selectedConv.participant_1;
    const supabase = createClient();

    const { data: msgData } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: otherId,
      content: newMessage.trim(),
    }).select().single();

    if (msgData) setMessages(prev => [...prev, msgData as Message]);

    // Update conversation
    await supabase.from('conversations').update({
      last_message: newMessage.trim(),
      last_message_at: new Date().toISOString(),
    }).eq('id', selectedConv.id);

    setNewMessage('');
    setSending(false);
    fetchConversations();
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const getOtherUser = (conv: Conversation) => {
    if (!user) return null;
    return conv.participant_1 === user.id ? conv.participant_2_profile : conv.participant_1_profile;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>
        <div className="bg-white border border-border shadow-sm rounded-xl h-[600px] flex">
          <div className="w-80 border-r border-border p-4 space-y-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      <div className="bg-white border border-border shadow-sm rounded-xl h-[calc(100vh-220px)] min-h-[500px] flex overflow-hidden">
        {/* Conversations List */}
        <div className={`w-full sm:w-80 border-r border-border flex flex-col shrink-0 ${selectedConv ? 'hidden sm:flex' : 'flex'}`}>
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search conversations..." className="pl-9 bg-white border-border h-9 text-sm" />
            </div>
          </div>
          <ScrollArea className="flex-1">
            {conversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
              </div>
            ) : (
              conversations.map(conv => {
                const other = getOtherUser(conv) as unknown as Profile | null;
                if (!other) return null;
                const isActive = selectedConv?.id === conv.id;
                return (
                  <button key={conv.id} onClick={() => selectConversation(conv)}
                    className={`w-full flex items-center gap-3 p-3 text-left hover:bg-muted transition-colors ${isActive ? 'bg-muted' : ''}`}
                  >
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarImage src={other.avatar_url || ''} />
                      <AvatarFallback className="bg-primary text-xs text-white">
                        {getInitials(other.full_name || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate text-foreground">{other.full_name}</p>
                        <span className="text-[10px] text-muted-foreground shrink-0">{formatRelativeTime(conv.last_message_at)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{conv.last_message || 'Start a conversation'}</p>
                    </div>
                  </button>
                );
              })
            )}
          </ScrollArea>
        </div>

        {/* Messages Pane */}
        <div className={`flex-1 flex flex-col ${selectedConv ? 'flex' : 'hidden sm:flex'}`}>
          {selectedConv && otherProfile ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-4 border-b border-border">
                <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setSelectedConv(null)}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={otherProfile.avatar_url || ''} />
                  <AvatarFallback className="bg-primary text-xs text-white">
                    {getInitials(otherProfile.full_name || 'U')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">{otherProfile.full_name}</p>
                  <p className="text-[10px] text-muted-foreground">@{otherProfile.username}</p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {messages.map(msg => {
                    const isMine = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                          isMine
                            ? 'bg-primary text-white rounded-br-md'
                            : 'bg-muted text-foreground rounded-bl-md'
                        }`}>
                          <p>{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${isMine ? 'text-white/60' : 'text-muted-foreground'}`}>
                            {formatRelativeTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <form onSubmit={handleSend} className="p-4 border-t border-border flex gap-2">
                <Input value={newMessage} onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type a message..." className="bg-white border-border flex-1" />
                <Button type="submit" size="icon" disabled={!newMessage.trim() || sending}
                  className="bg-primary hover:bg-primary/90 text-white border-0 shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <MessageSquare className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-1">Your Messages</h3>
                <p className="text-sm text-muted-foreground">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
