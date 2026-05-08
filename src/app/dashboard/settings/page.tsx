'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/lib/stores/auth-store';
import { createClient } from '@/lib/supabase/client';
import { profileSchema, type ProfileInput } from '@/lib/validations/schemas';
import { SKILLS, CATEGORIES } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, Loader2, Check } from 'lucide-react';
import { getInitials } from '@/lib/utils';

export default function SettingsPage() {
  const { user, profile, fetchProfile } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(profile?.skills || []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(profile?.categories || []);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema) as any,
    defaultValues: {
      full_name: profile?.full_name || '',
      username: profile?.username || '',
      bio: profile?.bio || '',
      college_name: profile?.college_name || '',
      location: profile?.location || '',
      hourly_rate: profile?.hourly_rate || 0,
      website: profile?.website || '',
      github: profile?.github || '',
      linkedin: profile?.linkedin || '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name,
        username: profile.username,
        bio: profile.bio,
        college_name: profile.college_name,
        location: profile.location,
        hourly_rate: profile.hourly_rate,
        website: profile.website,
        github: profile.github,
        linkedin: profile.linkedin,
      });
      setSelectedSkills(profile.skills || []);
      setSelectedCategories(profile.categories || []);
    }
  }, [profile, reset]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: ProfileInput) => {
    if (!user) return;
    setSaving(true);
    const supabase = createClient();

    let avatarUrl = profile?.avatar_url;
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true });
      if (!error) {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
        avatarUrl = urlData.publicUrl;
      }
    }

    await supabase.from('profiles').update({
      ...data,
      avatar_url: avatarUrl,
      skills: selectedSkills,
      categories: selectedCategories,
      hourly_rate: data.hourly_rate || 0,
    }).eq('id', user.id);

    await fetchProfile(user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and preferences.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Avatar */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Profile Photo</h2>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="w-20 h-20">
                <AvatarImage src={avatarPreview || profile?.avatar_url || ''} />
                <AvatarFallback className="bg-gradient-to-br from-violet-600 to-cyan-600 text-xl text-white">
                  {getInitials(profile?.full_name || 'U')}
                </AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                <Camera className="w-5 h-5 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <div>
              <p className="text-sm font-medium">Upload new photo</p>
              <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold mb-2">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Full Name</label>
              <Input {...register('full_name')} className="bg-white/5 border-white/10" />
              {errors.full_name && <p className="text-xs text-red-400 mt-1">{errors.full_name.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Username</label>
              <Input {...register('username')} className="bg-white/5 border-white/10" />
              {errors.username && <p className="text-xs text-red-400 mt-1">{errors.username.message}</p>}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Bio</label>
            <Textarea {...register('bio')} className="bg-white/5 border-white/10 min-h-[100px]" placeholder="Tell us about yourself..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">College</label>
              <Input {...register('college_name')} className="bg-white/5 border-white/10" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Location</label>
              <Input {...register('location')} className="bg-white/5 border-white/10" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Hourly Rate (USD)</label>
            <Input {...register('hourly_rate')} type="number" className="bg-white/5 border-white/10 w-40" />
          </div>
        </div>

        {/* Skills */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-2">Skills</h2>
          <p className="text-sm text-muted-foreground mb-4">Select skills that match your expertise.</p>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto scrollbar-thin">
            {SKILLS.map(skill => (
              <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  selectedSkills.includes(skill)
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                    : 'bg-white/5 text-muted-foreground border border-white/10 hover:border-white/20'
                }`}
              >{skill}</button>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold mb-2">Social Links</h2>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Website</label>
            <Input {...register('website')} className="bg-white/5 border-white/10" placeholder="https://yoursite.com" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">GitHub</label>
            <Input {...register('github')} className="bg-white/5 border-white/10" placeholder=" username" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">LinkedIn</label>
            <Input {...register('linkedin')} className="bg-white/5 border-white/10" placeholder="https://linkedin.com/in/..." />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white border-0 gap-2 px-8">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <><Check className="w-4 h-4" /> Saved!</> : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
