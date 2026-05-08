'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock, User, Sparkles, ArrowRight, GraduationCap, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { signupSchema, type SignupInput } from '@/lib/validations/schemas';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') as 'student' | 'client' | null;
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: defaultRole || 'student' },
  });

  const role = watch('role');

  const onSubmit = async (data: SignupInput) => {
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          role: data.role,
        },
      },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    // Update profile role
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ role: data.role, full_name: data.full_name }).eq('id', user.id);
    }
    router.push('/onboarding');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(6,182,212,0.12)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(139,92,246,0.08)_0%,_transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="glass-card rounded-2xl p-8 space-y-6">
          {/* Logo */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold mb-2">Create your account</h1>
            <p className="text-sm text-muted-foreground">
              Join the student freelance marketplace
            </p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'student' as const, icon: GraduationCap, label: 'Student', desc: 'I want to freelance' },
              { value: 'client' as const, icon: Briefcase, label: 'Client', desc: 'I want to hire' },
            ].map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setValue('role', r.value)}
                className={`p-4 rounded-xl border transition-all text-left ${
                  role === r.value
                    ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/10'
                    : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                <r.icon className={`w-5 h-5 mb-2 ${role === r.value ? 'text-violet-400' : 'text-muted-foreground'}`} />
                <p className="text-sm font-medium">{r.label}</p>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  {...register('full_name')}
                  placeholder="Full name"
                  className="pl-10 h-11 bg-white/5 border-white/10"
                />
              </div>
              {errors.full_name && <p className="text-xs text-red-400 mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="Email address"
                  className="pl-10 h-11 bg-white/5 border-white/10"
                />
              </div>
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password (min. 6 characters)"
                  className="pl-10 pr-10 h-11 bg-white/5 border-white/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-400/10 rounded-lg p-3">{error}</div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white border-0"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create account <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" /></div>}>
      <SignupForm />
    </Suspense>
  );
}
