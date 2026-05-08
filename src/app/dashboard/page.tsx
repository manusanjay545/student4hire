'use client';

import { useAuthStore } from '@/lib/stores/auth-store';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, MessageSquare, Star, DollarSign, Clock, Users, Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function DashboardHome() {
  const { profile } = useAuthStore();

  const studentStats = [
    { title: 'Total Earnings', value: '$1,250', icon: DollarSign, trend: '+12% this month' },
    { title: 'Active Projects', value: '3', icon: FolderOpen, trend: '2 ending soon' },
    { title: 'Unread Messages', value: '5', icon: MessageSquare, trend: 'Replies needed' },
    { title: 'Average Rating', value: '4.9', icon: Star, trend: 'Based on 12 reviews' },
  ];

  const clientStats = [
    { title: 'Total Spent', value: '$4,500', icon: DollarSign, trend: '+5% this month' },
    { title: 'Active Hires', value: '4', icon: Users, trend: 'In progress' },
    { title: 'Pending Requests', value: '2', icon: Clock, trend: 'Waiting for response' },
    { title: 'Saved Profiles', value: '18', icon: Star, trend: '3 new this week' },
  ];

  const stats = profile?.role === 'client' ? clientStats : studentStats;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {profile?.full_name} 👋</h1>
          <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your account today.</p>
        </div>
        {profile?.role === 'student' && !profile?.verified && (
          <div className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            Complete your profile to get verified
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-white border border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-white border border-border shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">New message from client</p>
                    <p className="text-xs text-muted-foreground">Hey, I love your portfolio! Are you available...</p>
                  </div>
                  <div className="text-xs text-muted-foreground">2h ago</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-white border border-border shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {profile?.role === 'student' ? (
              <>
                <Link href="/dashboard/portfolio" className="flex items-center p-3 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border">
                  <FolderOpen className="w-5 h-5 mr-3 text-primary" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">Update Portfolio</h4>
                    <p className="text-xs text-muted-foreground">Add your latest projects</p>
                  </div>
                </Link>
                <Link href={`/profile/${profile?.username}`} className="flex items-center p-3 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border">
                  <Star className="w-5 h-5 mr-3 text-primary" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">View Public Profile</h4>
                    <p className="text-xs text-muted-foreground">See how clients view you</p>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard/projects" className="flex items-center p-3 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border">
                  <Briefcase className="w-5 h-5 mr-3 text-primary" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">Post a Project</h4>
                    <p className="text-xs text-muted-foreground">Find the perfect student</p>
                  </div>
                </Link>
                <Link href="/explore" className="flex items-center p-3 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border">
                  <Users className="w-5 h-5 mr-3 text-primary" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">Browse Talent</h4>
                    <p className="text-xs text-muted-foreground">Search student profiles</p>
                  </div>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
