'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, ArrowRight, Sparkles, Code, Palette, Camera, PenTool, Video, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

/* ─── Animated counter ─── */
function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {value.toLocaleString()}{suffix}
      </motion.span>
    </motion.span>
  );
}

/* ─── Floating Orb ─── */
function FloatingOrb({ className }: { className?: string }) {
  return (
    <motion.div
      animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`}
    />
  );
}

/* ─── Hero Section ─── */
function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <FloatingOrb className="w-96 h-96 bg-violet-600 -top-20 -left-20" />
      <FloatingOrb className="w-80 h-80 bg-cyan-600 top-40 -right-20" />
      <FloatingOrb className="w-64 h-64 bg-pink-600 bottom-20 left-1/3" />

      {/* Grid lines */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.1)_0%,_transparent_70%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8 inline-flex"
          >
            <Badge className="px-4 py-2 text-sm bg-violet-500/10 text-violet-300 border-violet-500/20 hover:bg-violet-500/20 gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              The future of student freelancing is here
            </Badge>
          </motion.div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6">
            Where Student Talent{' '}
            <br className="hidden sm:block" />
            Meets{' '}
            <span className="gradient-text">Opportunity</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Discover exceptional student freelancers for your next project. From code to design,
            find fresh perspectives and cutting-edge skills at student-friendly rates.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity blur" />
              <div className="relative flex items-center glass-strong rounded-xl p-1.5">
                <Search className="w-5 h-5 text-muted-foreground ml-4 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Try "React developer", "UI designer", "video editor"...'
                  className="flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/60"
                />
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white border-0 px-6 rounded-lg"
                >
                  Search
                </Button>
              </div>
            </div>
          </form>

          {/* Trending Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            <span className="text-xs text-muted-foreground mr-1">Trending:</span>
            {['React', 'UI/UX', 'Python', 'Video Editing', 'Next.js', 'Figma'].map((tag) => (
              <Link key={tag} href={`/explore?q=${tag}`}>
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-white/10 transition-colors text-xs"
                >
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-3 max-w-md mx-auto gap-8"
          >
            {[
              { value: 12000, suffix: '+', label: 'Students' },
              { value: 5000, suffix: '+', label: 'Projects' },
              { value: 98, suffix: '%', label: 'Satisfaction' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold gradient-text">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Categories Section ─── */
const categories = [
  { icon: Code, label: 'Web Development', count: 2847, color: 'from-violet-500 to-purple-600' },
  { icon: Palette, label: 'UI/UX Design', count: 1923, color: 'from-pink-500 to-rose-600' },
  { icon: Camera, label: 'Photography', count: 1456, color: 'from-amber-500 to-orange-600' },
  { icon: PenTool, label: 'Graphic Design', count: 2134, color: 'from-cyan-500 to-blue-600' },
  { icon: Video, label: 'Video Editing', count: 982, color: 'from-green-500 to-emerald-600' },
  { icon: BarChart3, label: 'Data Science', count: 756, color: 'from-indigo-500 to-violet-600' },
];

function CategoriesSection() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-violet-500/10 text-violet-300 border-violet-500/20">
            Categories
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Explore by <span className="gradient-text">Category</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Find the perfect student freelancer across dozens of creative and technical categories.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link href={`/explore?category=${encodeURIComponent(cat.label)}`}>
                <div className="group glass-card rounded-xl p-6 hover:bg-white/[0.06] transition-all duration-300 cursor-pointer">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <cat.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">{cat.label}</h3>
                  <p className="text-sm text-muted-foreground">{cat.count.toLocaleString()} students</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Featured Students Section ─── */
const featuredStudents = [
  {
    name: 'Aria Chen', username: 'ariachen', avatar: '', role: 'Full-Stack Developer',
    skills: ['React', 'Node.js', 'TypeScript'], rating: 4.9, projects: 23, rate: 35,
    college: 'Stanford University',
  },
  {
    name: 'Marcus Rivera', username: 'marcusrivera', avatar: '', role: 'UI/UX Designer',
    skills: ['Figma', 'Adobe XD', 'Framer'], rating: 4.8, projects: 31, rate: 40,
    college: 'MIT',
  },
  {
    name: 'Zara Patel', username: 'zarapatel', avatar: '', role: 'Mobile Developer',
    skills: ['Flutter', 'React Native', 'Swift'], rating: 5.0, projects: 18, rate: 45,
    college: 'IIT Delhi',
  },
  {
    name: 'Leo Yamamoto', username: 'leoyamamoto', avatar: '', role: 'Video Editor',
    skills: ['Premiere Pro', 'After Effects', 'DaVinci'], rating: 4.7, projects: 42, rate: 30,
    college: 'UCLA',
  },
];

function FeaturedSection() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.06)_0%,_transparent_50%)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <Badge className="mb-4 bg-cyan-500/10 text-cyan-300 border-cyan-500/20">
              Featured
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Top <span className="gradient-text">Student Talent</span>
            </h2>
          </div>
          <Link href="/explore">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-white">
              View all <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredStudents.map((student, i) => (
            <motion.div
              key={student.username}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/profile/${student.username}`}>
                <div className="group glass-card rounded-xl p-5 hover:bg-white/[0.06] transition-all duration-300 hover:glow-violet cursor-pointer">
                  {/* Avatar */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate group-hover:text-violet-300 transition-colors">
                        {student.name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">{student.role}</p>
                    </div>
                  </div>

                  {/* College */}
                  <p className="text-xs text-muted-foreground mb-3">🎓 {student.college}</p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {student.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-[10px] px-2 py-0.5">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-yellow-400">★</span>
                      <span>{student.rating}</span>
                      <span className="text-muted-foreground">({student.projects})</span>
                    </div>
                    <span className="text-sm font-semibold text-violet-400">
                      ${student.rate}/hr
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works Section ─── */
const steps = [
  {
    step: '01',
    title: 'Create Your Profile',
    desc: 'Students showcase their skills, projects, and set their rates. Clients describe what they need.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    step: '02',
    title: 'Discover & Connect',
    desc: 'Browse talented students, filter by skills, and view stunning portfolios. Find the perfect match.',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    step: '03',
    title: 'Hire & Collaborate',
    desc: 'Send hire requests, discuss project details, and collaborate in real-time through our platform.',
    gradient: 'from-pink-500 to-rose-600',
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-pink-500/10 text-pink-300 border-pink-500/20">How It Works</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Three Steps to <span className="gradient-text-pink">Success</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass-card rounded-xl p-8 text-center relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-50 group-hover:opacity-100 transition-opacity" style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }} />
              <div className={`inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} items-center justify-center text-white font-bold text-lg mb-6`}>
                {step.step}
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA Section ─── */
function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(139,92,246,0.15)_0%,_transparent_60%)]" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl p-12 md:p-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Ready to Get <span className="gradient-text">Started?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Join thousands of students and clients already building amazing things together.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup?role=student">
              <Button size="lg" className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white border-0 px-8 shadow-lg shadow-violet-500/20 w-full sm:w-auto">
                Join as Student
              </Button>
            </Link>
            <Link href="/signup?role=client">
              <Button size="lg" variant="outline" className="border-white/10 hover:bg-white/5 px-8 w-full sm:w-auto">
                Hire a Student
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Home Page ─── */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturedSection />
      <HowItWorksSection />
      <CTASection />
    </>
  );
}
