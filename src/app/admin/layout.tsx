'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Users, LayoutDashboard, Sparkles, BarChart3 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const adminLinks = [
  { href: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/users', icon: Users, label: 'Users' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden lg:flex w-60 flex-col border-r border-white/5 bg-card/50 backdrop-blur-xl fixed inset-y-0 left-0 z-30">
        <div className="h-16 flex items-center px-6 border-b border-white/5 gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold">Admin Panel</span>
        </div>
        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-1">
            {adminLinks.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${isActive ? 'bg-violet-500/10 text-violet-300 font-medium' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}>
                  <link.icon className="w-4 h-4" /> {link.label}
                </Link>
              );
            })}
            <div className="border-t border-white/5 mt-4 pt-4">
              <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-white hover:bg-white/5">
                <Sparkles className="w-4 h-4" /> Back to App
              </Link>
            </div>
          </nav>
        </ScrollArea>
      </aside>
      <main className="flex-1 lg:ml-60 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
