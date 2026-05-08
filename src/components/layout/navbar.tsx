'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Search, Menu, X, Bell, User, LogOut, Settings,
  LayoutDashboard, Sparkles, Heart, MessageSquare, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getInitials } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore' },
  { href: '/projects', label: 'Projects' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, profile, signOut } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide navbar on dashboard pages (they have their own sidebar nav)
  const isDashboard = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin');
  if (isDashboard) return null;

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white border-b border-gray-200 ${
          scrolled ? 'shadow-sm' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                Student<span className="text-primary">lance</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Search Button */}
              <Link href="/explore">
                <Button variant="ghost" size="icon" className="hidden sm:flex text-muted-foreground hover:text-foreground">
                  <Search className="w-4 h-4" />
                </Button>
              </Link>

              {user ? (
                <>
                  {/* Notifications */}
                  <Link href="/dashboard/notifications">
                    <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                      <Bell className="w-4 h-4" />
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
                    </Button>
                  </Link>

                  {/* Messages */}
                  <Link href="/dashboard/messages">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </Link>

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 rounded-full p-0.5 hover:bg-muted transition-colors cursor-pointer">
                      <Avatar className="w-8 h-8 border border-border">
                        <AvatarImage src={profile?.avatar_url || ''} />
                        <AvatarFallback className="bg-primary text-xs text-white">
                          {getInitials(profile?.full_name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-white border-border shadow-md">
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium text-foreground">{profile?.full_name}</p>
                        <p className="text-xs text-muted-foreground">@{profile?.username}</p>
                      </div>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem render={<Link href="/dashboard" />} className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem render={<Link href={`/profile/${profile?.username}`} />} className="flex items-center gap-2">
                        <User className="w-4 h-4" /> Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem render={<Link href="/dashboard/settings" />} className="flex items-center gap-2">
                        <Settings className="w-4 h-4" /> Settings
                      </DropdownMenuItem>
                      {profile?.role === 'client' && (
                        <DropdownMenuItem render={<Link href="/dashboard/saved" />} className="flex items-center gap-2">
                          <Heart className="w-4 h-4" /> Saved
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive cursor-pointer">
                        <LogOut className="w-4 h-4 mr-2" /> Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-foreground hover:text-primary font-semibold">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-semibold">
                      Join
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-muted-foreground"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed inset-x-0 top-16 z-40 bg-white border-b border-border shadow-md md:hidden"
          >
            <nav className="flex flex-col p-4 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-primary hover:bg-muted rounded-md'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      {!isDashboard && <div className="h-16 lg:h-18" />}
    </>
  );
}
