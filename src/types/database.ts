// ============================================================
// Studentlance — TypeScript types matching Supabase schema
// ============================================================

export type UserRole = 'student' | 'client' | 'admin';
export type ProjectStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
export type HireStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  cover_url: string | null;
  role: UserRole;
  bio: string;
  college_name: string;
  skills: string[];
  categories: string[];
  hourly_rate: number;
  location: string;
  website: string;
  github: string;
  linkedin: string;
  available: boolean;
  verified: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface PortfolioProject {
  id: string;
  user_id: string;
  title: string;
  description: string;
  images: string[];
  video_url: string;
  tags: string[];
  category: string;
  project_link: string;
  likes: number;
  views: number;
  created_at: string;
  updated_at: string;
  // Joined
  profiles?: Profile;
}

export interface ClientProject {
  id: string;
  client_id: string;
  title: string;
  description: string;
  budget: number;
  skills_required: string[];
  category: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  // Joined
  profiles?: Profile;
}

export interface HireRequest {
  id: string;
  client_id: string;
  student_id: string;
  project_id: string | null;
  message: string;
  budget: number;
  status: HireStatus;
  created_at: string;
  updated_at: string;
  // Joined
  client?: Profile;
  student?: Profile;
  project?: ClientProject;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  // Joined
  sender?: Profile;
}

export interface Review {
  id: string;
  reviewer_id: string;
  student_id: string;
  rating: number;
  comment: string;
  created_at: string;
  // Joined
  reviewer?: Profile;
}

export interface SavedProfile {
  id: string;
  client_id: string;
  student_id: string;
  created_at: string;
  // Joined
  student?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  content: string;
  link: string;
  read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message: string;
  last_message_at: string;
  created_at: string;
  // Joined
  participant_1_profile?: Profile;
  participant_2_profile?: Profile;
}

// Categories for the platform
export const CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Graphic Design',
  'Video Editing',
  'Content Writing',
  'Data Science',
  'Machine Learning',
  'Digital Marketing',
  'Photography',
  'Music & Audio',
  'Animation',
  '3D Modeling',
  'Game Development',
  'Blockchain',
  'Cloud & DevOps',
] as const;

export const SKILLS = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Python', 'Node.js',
  'Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'After Effects',
  'Flutter', 'React Native', 'Swift', 'Kotlin',
  'TailwindCSS', 'CSS', 'HTML', 'Vue.js', 'Angular',
  'PostgreSQL', 'MongoDB', 'Firebase', 'Supabase',
  'AWS', 'Docker', 'Git', 'Linux',
  'TensorFlow', 'PyTorch', 'Pandas', 'OpenAI',
  'Premiere Pro', 'DaVinci Resolve', 'Blender',
  'Unity', 'Unreal Engine', 'Godot',
  'Solidity', 'Rust', 'Go', 'Java', 'C++',
  'SEO', 'Google Ads', 'Social Media', 'Copywriting',
] as const;
