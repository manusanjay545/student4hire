'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, ArrowRight, Sparkles, Code, Palette, Camera, PenTool, Video, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';

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
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-[#013914]">

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
            <Badge className="px-4 py-2 text-sm bg-white/10 text-white border-white/20 gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              The future of student freelancing is here
            </Badge>
          </motion.div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6 text-white">
            Find the right <i className="font-serif font-light text-primary">student freelance</i> service, right away
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Discover exceptional student freelancers for your next project. From code to design,
            find fresh perspectives and cutting-edge skills.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10">
            <div className="relative flex items-center bg-white rounded-lg p-1 w-full max-w-3xl">
              <Search className="w-5 h-5 text-muted-foreground ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search for any service...'
                className="flex-1 bg-transparent px-3 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <Button
                type="submit"
                className="bg-primary hover:bg-[#19a463] text-white font-bold text-base border-0 px-8 py-6 rounded-md h-auto"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </form>

          {/* Trending Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            <span className="text-sm font-semibold text-white mr-1">Popular:</span>
            {['Website Design', 'WordPress', 'Logo Design', 'Video Editing'].map((tag) => (
              <Link key={tag} href={`/explore?q=${tag}`}>
                <Badge
                  variant="outline"
                  className="cursor-pointer border-white/40 text-white hover:bg-white hover:text-[#013914] transition-colors rounded-full px-4 py-1.5 font-medium"
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
              <div key={stat.label} className="text-center text-white">
                <div className="text-2xl sm:text-3xl font-bold">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-xs text-white/80 mt-1 font-medium">{stat.label}</p>
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
          className="mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-foreground">
            Explore the marketplace
          </h2>
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
                <div className="group bg-white border border-border rounded-xl p-6 hover:shadow-md transition-all duration-300 cursor-pointer text-left">
                  <div className={`w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <cat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1 text-foreground">{cat.label}</h3>
                  <p className="text-sm text-muted-foreground font-medium">{cat.count.toLocaleString()} students</p>
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
    <section className="py-24 relative bg-muted/20">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Top Student Talent
          </h2>
          <Link href="/explore">
            <Button variant="ghost" className="gap-2 text-foreground hover:bg-muted font-medium">
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
                <div className="group bg-white border border-border rounded-xl p-5 hover:shadow-md transition-all duration-300 cursor-pointer">
                  {/* Avatar */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate group-hover:text-primary text-foreground transition-colors">
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
                  <div className="flex items-center justify-between pt-3 border-t border-border mt-4">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-yellow-500">★</span>
                      <span className="font-medium text-foreground">{student.rating}</span>
                      <span className="text-muted-foreground">({student.projects})</span>
                    </div>
                    <span className="text-sm font-semibold text-primary">
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
          className="mb-12 text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
            Three Steps to Success
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
              className="bg-white border border-border shadow-sm rounded-xl p-8 text-center relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={`inline-flex w-14 h-14 rounded-2xl bg-primary/10 items-center justify-center text-primary font-bold text-lg mb-6`}>
                {step.step}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA Section ─── */
function CTASection() {
  const { user } = useAuthStore();

  return (
    <section className="py-24 relative overflow-hidden bg-primary/5">
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-border shadow-sm rounded-2xl p-12 md:p-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Ready to Get <span className="text-primary">Started?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Join thousands of students and clients already building amazing things together.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link href="/dashboard">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold border-0 px-8 w-full sm:w-auto">
                  Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signup?role=student">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold border-0 px-8 w-full sm:w-auto">
                    Join as Student
                  </Button>
                </Link>
                <Link href="/signup?role=client">
                  <Button size="lg" variant="outline" className="border-border hover:bg-muted font-semibold text-foreground px-8 w-full sm:w-auto">
                    Hire a Student
                  </Button>
                </Link>
              </>
            )}
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
