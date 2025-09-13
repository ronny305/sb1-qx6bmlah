import { supabase } from './supabase';

export interface Project {
  id: number;
  title: string;
  category: string;
  date: string;
  description: string;
  full_description: string;
  image: string;
  client: string;
  duration: string;
  gallery?: string[];
  created_at?: string;
  updated_at?: string;
}

// Fetch total projects count for admin dashboard
export const fetchProjectsCount = async (): Promise<number> => {
  console.log('fetchProjectsCount: Calling Supabase to count projects...');
  const { count, error } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('fetchProjectsCount: Supabase error:', error);
    throw new Error('Failed to fetch projects count');
  }

  console.log('fetchProjectsCount: Projects count:', count);
  return count || 0;
};

// Fetch recent projects for admin dashboard
export const fetchRecentProjects = async (limit = 5): Promise<any[]> => {
  console.log(`fetchRecentProjects: Calling Supabase to fetch ${limit} recent projects...`);
  const { data, error } = await supabase
    .from('projects')
    .select('id, title, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('fetchRecentProjects: Supabase error:', error);
    throw new Error('Failed to fetch recent projects');
  }

  console.log('fetchRecentProjects: Recent projects data received:', data);
  return data || [];
};