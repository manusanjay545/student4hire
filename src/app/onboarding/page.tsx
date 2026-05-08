'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, ArrowLeft, Upload, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { profileSchema, type ProfileInput } from '@/lib/validations/schemas';
import { SKILLS, CATEGORIES } from '@/types/database';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, fetchProfile } = useAuthStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema) as any,
    defaultValues: {
      full_name: profile?.full_name || '',
      username: profile?.username || '',
      bio: '',
      college_name: '',
      location: '',
      hourly_rate: 0,
    },
  });

  const toggleSkill = (skill: string) => {
    const updated = selectedSkills.includes(skill)
      ? selectedSkills.filter((s) => s !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(updated);
  };

  const toggleCategory = (cat: string) => {
    const updated = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat];
    setSelectedCategories(updated);
  };

  const onSubmit = async (data: ProfileInput) => {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from('profiles').update({
      ...data,
      skills: selectedSkills,
      categories: selectedCategories,
      hourly_rate: data.hourly_rate || 0,
    }).eq('id', user.id);

    await fetchProfile(user.id);
    router.push('/dashboard');
    router.refresh();
  };

  const steps = [
    {
      title: 'Tell us about yourself',
      desc: 'Add your basic information',
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Full Name</label>
            <Input {...register('full_name')} className="bg-white/5 border-white/10 h-11" placeholder="John Doe" />
            {errors.full_name && <p className="text-xs text-red-400 mt-1">{errors.full_name.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Username</label>
            <Input {...register('username')} className="bg-white/5 border-white/10 h-11" placeholder="johndoe" />
            {errors.username && <p className="text-xs text-red-400 mt-1">{errors.username.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Bio</label>
            <Textarea {...register('bio')} className="bg-white/5 border-white/10 min-h-[80px]" placeholder="Tell the world about yourself..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">College</label>
              <Input {...register('college_name')} className="bg-white/5 border-white/10 h-11" placeholder="Stanford" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Location</label>
              <Input {...register('location')} className="bg-white/5 border-white/10 h-11" placeholder="San Francisco" />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Select your skills',
      desc: 'Choose the skills that define your expertise',
      content: (
        <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto scrollbar-thin pr-2">
          {SKILLS.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                selectedSkills.includes(skill)
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'bg-white/5 text-muted-foreground border border-white/10 hover:border-white/20'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: 'Set your rate',
      desc: 'How much do you charge per hour?',
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Hourly Rate (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                {...register('hourly_rate')}
                type="number"
                className="bg-white/5 border-white/10 h-11 pl-8"
                placeholder="25"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Categories</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    selectedCategories.includes(cat)
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-white/5 text-muted-foreground border border-white/10 hover:border-white/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Social Links</label>
            <div className="space-y-3">
              <Input {...register('github')} className="bg-white/5 border-white/10 h-10" placeholder="GitHub username" />
              <Input {...register('linkedin')} className="bg-white/5 border-white/10 h-10" placeholder="LinkedIn profile URL" />
              <Input {...register('website')} className="bg-white/5 border-white/10 h-10" placeholder="Personal website URL" />
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.08)_0%,_transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-lg"
      >
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i <= step ? 'bg-gradient-to-r from-violet-500 to-cyan-500' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="glass-card rounded-2xl p-8">
            {/* Step Header */}
            <div className="mb-6">
              <Badge className="mb-3 bg-violet-500/10 text-violet-300 border-violet-500/20">
                Step {step + 1} of {steps.length}
              </Badge>
              <h1 className="text-2xl font-bold mb-1">{steps[step].title}</h1>
              <p className="text-sm text-muted-foreground">{steps[step].desc}</p>
            </div>

            {/* Step Content */}
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {steps[step].content}
            </motion.div>

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-white/5">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>

              {step < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white border-0 gap-2"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white border-0 gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Complete Setup <Sparkles className="w-4 h-4" /></>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link href="/dashboard" className="hover:text-white">Skip for now →</Link>
        </p>
      </motion.div>
    </div>
  );
}
