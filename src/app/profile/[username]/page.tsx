'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  MapPin, Globe, Mail, Star, Calendar, Clock,
  Heart, MessageSquare, ExternalLink, Play, X, ChevronLeft, ChevronRight,
  CheckCircle, Briefcase, Trash2, AlertTriangle, Loader2
} from 'lucide-react';

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>);
const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>);
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getInitials, formatDate } from '@/lib/utils';
import type { Profile, PortfolioProject, Review } from '@/types/database';

/* ─── Portfolio Card ─── */
function PortfolioCard({ project, onClick }: { project: PortfolioProject; onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="glass-card rounded-xl overflow-hidden cursor-pointer group"
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-gradient-to-br from-violet-900/30 to-cyan-900/30 relative overflow-hidden">
        {project.images?.[0] ? (
          <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Briefcase className="w-10 h-10 text-muted-foreground/30" />
          </div>
        )}
        {project.video_url && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
          </div>
        )}
      </div>
      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-sm mb-1 group-hover:text-violet-300 transition-colors truncate">{project.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
        <div className="flex flex-wrap gap-1">
          {project.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Review Card ─── */
function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
          {getInitials(review.reviewer?.full_name || 'U')}
        </div>
        <div>
          <p className="text-sm font-medium">{review.reviewer?.full_name || 'Anonymous'}</p>
          <p className="text-xs text-muted-foreground">{formatDate(review.created_at)}</p>
        </div>
        <div className="ml-auto flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'}`} />
          ))}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{review.comment}</p>
    </div>
  );
}

/* ─── Profile Page ─── */
export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { user, profile: currentUserProfile, setSession } = useAuthStore();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [hireMessage, setHireMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();
      
      if (profileData) {
        setProfile(profileData as Profile);

        // Fetch portfolio
        const { data: portfolioData } = await supabase
          .from('portfolio_projects')
          .select('*')
          .eq('user_id', profileData.id)
          .order('created_at', { ascending: false });
        setPortfolio((portfolioData as PortfolioProject[]) || []);

        // Fetch reviews
        const { data: reviewData } = await supabase
          .from('reviews')
          .select('*, reviewer:reviewer_id(full_name, avatar_url, username)')
          .eq('student_id', profileData.id)
          .order('created_at', { ascending: false });
        setReviews((reviewData as unknown as Review[]) || []);

        // Check if saved
        if (user) {
          const { data: savedData } = await supabase
            .from('saved_profiles')
            .select('id')
            .eq('client_id', user.id)
            .eq('student_id', profileData.id)
            .single();
          setIsSaved(!!savedData);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [username, user]);

  const toggleSave = async () => {
    if (!user || !profile) return;
    const supabase = createClient();
    if (isSaved) {
      await supabase.from('saved_profiles').delete().eq('client_id', user.id).eq('student_id', profile.id);
      setIsSaved(false);
    } else {
      await supabase.from('saved_profiles').insert({ client_id: user.id, student_id: profile.id });
      setIsSaved(true);
    }
  };

  const sendHireRequest = async () => {
    if (!user || !profile || !hireMessage.trim()) return;
    setSending(true);
    const supabase = createClient();
    await supabase.from('hire_requests').insert({
      client_id: user.id,
      student_id: profile.id,
      message: hireMessage,
    });
    setSending(false);
    setHireMessage('');
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/user/delete', { method: 'DELETE' });
      if (res.ok) {
        const supabase = createClient();
        await supabase.auth.signOut();
        setSession(null);
        router.push('/');
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete account.');
      }
    } catch (error) {
      alert('An error occurred while deleting your account.');
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  if (loading) {
    return (
      <div className="min-h-screen max-w-5xl mx-auto px-4 py-8">
        <Skeleton className="h-48 rounded-2xl mb-8" />
        <div className="flex gap-6">
          <Skeleton className="w-32 h-32 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Profile not found</h1>
          <p className="text-muted-foreground mb-6">This user doesn&apos;t exist.</p>
          <Link href="/explore"><Button className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white border-0">Browse Students</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Cover */}
      <div className="h-48 md:h-56 bg-gradient-to-r from-violet-900/40 via-purple-900/30 to-cyan-900/40 relative">
        {profile.cover_url && (
          <img src={profile.cover_url} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          {/* Avatar */}
          <Avatar className="w-28 h-28 border-4 border-background shrink-0">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback className="bg-gradient-to-br from-violet-600 to-cyan-600 text-2xl text-white">
              {getInitials(profile.full_name)}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 pt-2">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl font-bold">{profile.full_name}</h1>
              {profile.verified && (
                <CheckCircle className="w-5 h-5 text-blue-400 fill-blue-400" />
              )}
              {profile.available && (
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                  Available
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mb-2">@{profile.username}</p>
            {profile.bio && <p className="text-sm text-muted-foreground max-w-xl mb-3">{profile.bio}</p>}
            
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              {profile.college_name && (
                <span className="flex items-center gap-1">🎓 {profile.college_name}</span>
              )}
              {profile.location && (
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {profile.location}</span>
              )}
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined {formatDate(profile.created_at)}</span>
              {profile.hourly_rate > 0 && (
                <span className="flex items-center gap-1 text-violet-400 font-semibold">
                  <Clock className="w-3 h-3" /> ${profile.hourly_rate}/hr
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 sm:flex-col sm:items-end shrink-0">
            {user && user.id !== profile.id && (
              <>
                <Dialog>
                  <DialogTrigger>
                    <Button className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white border-0 gap-2 shadow-lg shadow-violet-500/20">
                      <Briefcase className="w-4 h-4" /> Hire
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-strong border-white/10">
                    <DialogHeader>
                      <DialogTitle>Send Hire Request to {profile.full_name}</DialogTitle>
                    </DialogHeader>
                    <Textarea
                      value={hireMessage}
                      onChange={(e) => setHireMessage(e.target.value)}
                      placeholder="Describe your project and what you need..."
                      className="bg-white/5 border-white/10 min-h-[120px]"
                    />
                    <Button onClick={sendHireRequest} disabled={sending || !hireMessage.trim()} className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white border-0">
                      {sending ? 'Sending...' : 'Send Request'}
                    </Button>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" className="border-white/10 gap-2" onClick={toggleSave}>
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-400 text-red-400' : ''}`} />
                  {isSaved ? 'Saved' : 'Save'}
                </Button>
              </>
            )}

            {user && user.id === profile.id && (
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-0 gap-2 mb-2 w-full sm:w-auto">
                    <Trash2 className="w-4 h-4" /> Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-strong border-white/10 max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-red-500 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" /> Danger Zone
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <p className="text-sm text-muted-foreground">
                      Are you absolutely sure you want to delete your account? This action <strong>cannot</strong> be undone. All your profile data, projects, messages, and reviews will be permanently deleted from the database.
                    </p>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting} className="gap-2">
                        {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Yes, Delete My Account
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Social Links */}
            <div className="flex gap-2">
              {profile.github && (
                <a href={`https://github.com/${profile.github}`} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
                  <GithubIcon className="w-4 h-4" />
                </a>
              )}
              {profile.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
                  <LinkedinIcon className="w-4 h-4" />
                </a>
              )}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Skills */}
        {profile.skills?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {profile.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
            ))}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Projects', value: portfolio.length },
            { label: 'Avg Rating', value: avgRating, icon: <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> },
            { label: 'Reviews', value: reviews.length },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                {stat.icon}
                <span className="text-xl font-bold">{stat.value}</span>
              </div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="portfolio">Portfolio ({portfolio.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio">
            {portfolio.length === 0 ? (
              <div className="text-center py-16 glass-card rounded-xl">
                <Briefcase className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No portfolio projects yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolio.map((project) => (
                  <PortfolioCard
                    key={project.id}
                    project={project}
                    onClick={() => setSelectedProject(project)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews">
            {reviews.length === 0 ? (
              <div className="text-center py-16 glass-card rounded-xl">
                <Star className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No reviews yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Project Modal */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="glass-strong border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedProject.title}</DialogTitle>
              </DialogHeader>
              {selectedProject.images?.[0] && (
                <div className="rounded-xl overflow-hidden aspect-video bg-black/20">
                  <img src={selectedProject.images[0]} alt={selectedProject.title} className="w-full h-full object-contain" />
                </div>
              )}
              <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
              <div className="flex flex-wrap gap-2">
                {selectedProject.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
              {selectedProject.project_link && (
                <a href={selectedProject.project_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300">
                  <ExternalLink className="w-4 h-4" /> View Project
                </a>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
