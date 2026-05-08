'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense, useCallback } from 'react';
import { Search, SlidersHorizontal, X, Star, MapPin, Clock, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';
import { CATEGORIES } from '@/types/database';
import { getInitials } from '@/lib/utils';

/* ─── Student Card ─── */
function StudentCard({ student }: { student: Profile }) {
  return (
    <Link href={`/profile/${student.username}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="glass-card rounded-xl p-5 hover:bg-white/[0.06] transition-all duration-300 hover:glow-violet cursor-pointer h-full flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shrink-0 relative">
            {student.avatar_url ? (
              <img src={student.avatar_url} alt={student.full_name} className="w-full h-full rounded-full object-cover" />
            ) : (
              getInitials(student.full_name)
            )}
            {student.available && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-card" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-sm truncate">{student.full_name}</h3>
              {student.verified && <span className="text-blue-400 text-xs">✓</span>}
            </div>
            <p className="text-xs text-muted-foreground truncate">@{student.username}</p>
          </div>
        </div>

        {/* Bio */}
        {student.bio && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{student.bio}</p>
        )}

        {/* College */}
        {student.college_name && (
          <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
            🎓 {student.college_name}
          </p>
        )}

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-4 flex-1">
          {student.skills?.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-[10px] px-2 py-0.5">
              {skill}
            </Badge>
          ))}
          {student.skills?.length > 4 && (
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
              +{student.skills.length - 4}
            </Badge>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {student.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {student.location}
              </span>
            )}
          </div>
          {student.hourly_rate > 0 && (
            <span className="text-sm font-semibold text-violet-400">
              ${student.hourly_rate}/hr
            </span>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

/* ─── Filter Panel ─── */
function FilterPanel({
  category, setCategory,
  sortBy, setSortBy,
  minRate, setMinRate,
  maxRate, setMaxRate,
}: {
  category: string; setCategory: (v: string) => void;
  sortBy: string; setSortBy: (v: string) => void;
  minRate: string; setMinRate: (v: string) => void;
  maxRate: string; setMaxRate: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">Category</label>
        <Select value={category} onValueChange={(v) => setCategory(v ?? '')}>
          <SelectTrigger className="bg-white/5 border-white/10">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent className="glass-strong border-white/10">
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Sort by</label>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v ?? '')}>
          <SelectTrigger className="bg-white/5 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass-strong border-white/10">
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="rate_low">Price: Low to High</SelectItem>
            <SelectItem value="rate_high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Hourly Rate</label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Min $"
            value={minRate}
            onChange={(e) => setMinRate(e.target.value)}
            className="bg-white/5 border-white/10"
            type="number"
          />
          <Input
            placeholder="Max $"
            value={maxRate}
            onChange={(e) => setMaxRate(e.target.value)}
            className="bg-white/5 border-white/10"
            type="number"
          />
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full border-white/10"
        onClick={() => { setCategory('all'); setMinRate(''); setMaxRate(''); }}
      >
        Clear Filters
      </Button>
    </div>
  );
}

/* ─── Explore Content ─── */
function ExploreContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'all';

  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('newest');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase.from('profiles').select('*').eq('role', 'student');

    if (category && category !== 'all') {
      query = query.contains('categories', [category]);
    }
    if (minRate) query = query.gte('hourly_rate', parseFloat(minRate));
    if (maxRate) query = query.lte('hourly_rate', parseFloat(maxRate));

    if (sortBy === 'rate_low') query = query.order('hourly_rate', { ascending: true });
    else if (sortBy === 'rate_high') query = query.order('hourly_rate', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    query = query.limit(50);

    const { data } = await query;
    let results = (data as Profile[]) || [];

    // Client-side search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (s) =>
          s.full_name.toLowerCase().includes(q) ||
          s.username.toLowerCase().includes(q) ||
          s.skills?.some((sk) => sk.toLowerCase().includes(q)) ||
          s.bio?.toLowerCase().includes(q) ||
          s.college_name?.toLowerCase().includes(q)
      );
    }

    setStudents(results);
    setLoading(false);
  }, [searchQuery, category, sortBy, minRate, maxRate]);

  useEffect(() => {
    const debounce = setTimeout(fetchStudents, 300);
    return () => clearTimeout(debounce);
  }, [fetchStudents]);

  return (
    <div className="min-h-screen pt-4 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Explore <span className="gradient-text">Student Talent</span>
          </h1>
          <p className="text-muted-foreground">
            Discover {students.length} talented students ready to bring your project to life.
          </p>
        </motion.div>

        {/* Search + Filters bar */}
        <div className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students, skills, colleges..."
              className="pl-10 bg-white/5 border-white/10 h-11"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Desktop filter */}
          <div className="hidden lg:flex gap-2">
            <Select value={category} onValueChange={(v) => setCategory(v ?? '')}>
              <SelectTrigger className="w-48 bg-white/5 border-white/10">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="glass-strong border-white/10">
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v ?? '')}>
              <SelectTrigger className="w-44 bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-strong border-white/10">
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="rate_low">Price: Low→High</SelectItem>
                <SelectItem value="rate_high">Price: High→Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mobile filter sheet */}
          <Sheet>
            <SheetTrigger>
              <Button variant="outline" size="icon" className="lg:hidden border-white/10 h-11 w-11">
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="glass-strong border-white/10">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterPanel
                  category={category} setCategory={setCategory}
                  sortBy={sortBy} setSortBy={setSortBy}
                  minRate={minRate} setMinRate={setMinRate}
                  maxRate={maxRate} setMaxRate={setMaxRate}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass-card rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : students.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No students found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
            <Button variant="outline" className="border-white/10" onClick={() => { setSearchQuery(''); setCategory('all'); }}>
              Clear all filters
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {students.map((student, i) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <StudentCard student={student} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-4 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-5 w-96 mb-8" />
          <Skeleton className="h-11 w-full mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}
