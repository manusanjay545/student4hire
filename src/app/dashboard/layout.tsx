'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, User, FolderOpen, MessageSquare, Bell, Settings,
  Heart, Briefcase, PlusCircle, BarChart3, Sparkles, LogOut, ChevronLeft,
  Shield, Users, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getInitials } from '@/lib/utils';

const studentLinks = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/portfolio', icon: FolderOpen, label: 'Portfolio' },
  { href: '/dashboard/requests', icon: Briefcase, label: 'Requests' },
  { href: '/dashboard/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

const clientLinks = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/projects', icon: PlusCircle, label: 'Projects' },
  { href: '/dashboard/requests', icon: Briefcase, label: 'Requests' },
  { href: '/dashboard/saved', icon: Heart, label: 'Saved' },
  { href: '/dashboard/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

const adminLinks = [
  { href: '/admin', icon: Shield, label: 'Admin Panel' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuthStore();

  const links = profile?.role === 'admin' ? adminLinks
    : profile?.role === 'client' ? clientLinks
    : studentLinks;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-white/5 bg-card/50 backdrop-blur-xl shrink-0 fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold">
              Student<span className="gradient-text">lance</span>
            </span>
          </Link>
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-violet-500/10 text-violet-300 font-medium'
                      : 'text-muted-foreground hover:text-white hover:bg-white/5'
                  }`}
                >
                  <link.icon className="w-4 h-4 shrink-0" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* User */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-9 h-9">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-gradient-to-br from-violet-600 to-cyan-600 text-xs text-white">
                {getInitials(profile?.full_name || 'U')}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{profile?.full_name}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">{profile?.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-red-400 gap-2"
            onClick={async () => { await signOut(); router.push('/'); }}
          >
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-14 glass-strong border-b border-white/5 z-30 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold">Studentlance</span>
        </Link>
        <Link href="/dashboard/settings">
          <Avatar className="w-8 h-8">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="bg-gradient-to-br from-violet-600 to-cyan-600 text-xs text-white">
              {getInitials(profile?.full_name || 'U')}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 glass-strong border-t border-white/5 z-30">
        <nav className="flex items-center justify-around py-2">
          {links.slice(0, 5).map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                  isActive ? 'text-violet-400' : 'text-muted-foreground'
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span className="text-[10px]">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8 pt-18 lg:pt-8 pb-24 lg:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
