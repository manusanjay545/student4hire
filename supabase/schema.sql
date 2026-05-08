-- ============================================================
-- STUDENTLANCE — Complete Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  cover_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'client', 'admin')) DEFAULT 'student',
  bio TEXT DEFAULT '',
  college_name TEXT DEFAULT '',
  skills TEXT[] DEFAULT '{}',
  categories TEXT[] DEFAULT '{}',
  hourly_rate NUMERIC(10,2) DEFAULT 0,
  location TEXT DEFAULT '',
  website TEXT DEFAULT '',
  github TEXT DEFAULT '',
  linkedin TEXT DEFAULT '',
  available BOOLEAN DEFAULT true,
  verified BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PORTFOLIO PROJECTS
-- ============================================================
CREATE TABLE public.portfolio_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  images TEXT[] DEFAULT '{}',
  video_url TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  category TEXT DEFAULT '',
  project_link TEXT DEFAULT '',
  likes INT DEFAULT 0,
  views INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CLIENT PROJECTS (Job Posts)
-- ============================================================
CREATE TABLE public.client_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  budget NUMERIC(10,2) DEFAULT 0,
  skills_required TEXT[] DEFAULT '{}',
  category TEXT DEFAULT '',
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- HIRE REQUESTS
-- ============================================================
CREATE TABLE public.hire_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.client_projects(id) ON DELETE SET NULL,
  message TEXT DEFAULT '',
  budget NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SAVED PROFILES (Favorites)
-- ============================================================
CREATE TABLE public.saved_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, student_id)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL DEFAULT '',
  content TEXT DEFAULT '',
  link TEXT DEFAULT '',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CONVERSATIONS (for chat grouping)
-- ============================================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_1 UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  participant_2 UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  last_message TEXT DEFAULT '',
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_1, participant_2)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_skills ON public.profiles USING GIN(skills);
CREATE INDEX idx_profiles_categories ON public.profiles USING GIN(categories);
CREATE INDEX idx_portfolio_user ON public.portfolio_projects(user_id);
CREATE INDEX idx_portfolio_category ON public.portfolio_projects(category);
CREATE INDEX idx_client_projects_client ON public.client_projects(client_id);
CREATE INDEX idx_client_projects_status ON public.client_projects(status);
CREATE INDEX idx_hire_requests_student ON public.hire_requests(student_id);
CREATE INDEX idx_hire_requests_client ON public.hire_requests(client_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX idx_reviews_student ON public.reviews(student_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_conversations_p1 ON public.conversations(participant_1);
CREATE INDEX idx_conversations_p2 ON public.conversations(participant_2);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Portfolio Projects
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Portfolio projects are viewable by everyone" ON public.portfolio_projects FOR SELECT USING (true);
CREATE POLICY "Users can insert own portfolio" ON public.portfolio_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own portfolio" ON public.portfolio_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own portfolio" ON public.portfolio_projects FOR DELETE USING (auth.uid() = user_id);

-- Client Projects
ALTER TABLE public.client_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Client projects viewable by all" ON public.client_projects FOR SELECT USING (true);
CREATE POLICY "Clients can insert projects" ON public.client_projects FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients can update own projects" ON public.client_projects FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Clients can delete own projects" ON public.client_projects FOR DELETE USING (auth.uid() = client_id);

-- Hire Requests
ALTER TABLE public.hire_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own hire requests" ON public.hire_requests FOR SELECT USING (auth.uid() = client_id OR auth.uid() = student_id);
CREATE POLICY "Clients can create hire requests" ON public.hire_requests FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Involved users can update hire requests" ON public.hire_requests FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = student_id);

-- Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Receiver can update (mark read)" ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);

-- Reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = reviewer_id);
CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = reviewer_id);

-- Saved Profiles
ALTER TABLE public.saved_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own saved" ON public.saved_profiles FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can save profiles" ON public.saved_profiles FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Users can unsave profiles" ON public.saved_profiles FOR DELETE USING (auth.uid() = client_id);

-- Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view conversations" ON public.conversations FOR SELECT USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Participants can update conversations" ON public.conversations FOR UPDATE USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', '_') || '_' || SUBSTR(NEW.id::TEXT, 1, 4)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_portfolio_updated_at BEFORE UPDATE ON public.portfolio_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_client_projects_updated_at BEFORE UPDATE ON public.client_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_hire_requests_updated_at BEFORE UPDATE ON public.hire_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true) ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Anyone can upload an avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::TEXT = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::TEXT = (storage.foldername(name))[1]);

CREATE POLICY "Portfolio images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio');
CREATE POLICY "Anyone can upload portfolio images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'portfolio' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own portfolio images" ON storage.objects FOR UPDATE USING (bucket_id = 'portfolio' AND auth.uid()::TEXT = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own portfolio images" ON storage.objects FOR DELETE USING (bucket_id = 'portfolio' AND auth.uid()::TEXT = (storage.foldername(name))[1]);

CREATE POLICY "Cover images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'covers');
CREATE POLICY "Anyone can upload cover images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'covers' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own cover" ON storage.objects FOR UPDATE USING (bucket_id = 'covers' AND auth.uid()::TEXT = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own cover" ON storage.objects FOR DELETE USING (bucket_id = 'covers' AND auth.uid()::TEXT = (storage.foldername(name))[1]);

-- ============================================================
-- SEED DATA (Demo Students & Projects)
-- ============================================================
-- Note: Seed data should be inserted AFTER creating real auth users.
-- Below are example inserts for demonstration when you have user IDs.
-- You can run these manually or create users first via the Auth UI.

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hire_requests;

