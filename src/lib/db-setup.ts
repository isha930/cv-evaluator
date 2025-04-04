
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Example of creating a job - using the new database tables structure
export const createJob = async (jobData) => {
  const { data, error } = await supabase
    .from('resumes')
    .insert({
      job_title: jobData.title,
      job_description: jobData.description, 
      skills_weight: jobData.skillsWeight,
      experience_weight: jobData.experienceWeight,
      user_id: '00000000-0000-0000-0000-000000000000' // Default user ID for demo purposes
    })
    .select();
  
  if (error) throw error;
  return data;
};

// Example of fetching jobs
export const getJobs = async () => {
  const { data, error } = await supabase
    .from('resumes')
    .select('*');
  
  if (error) throw error;
  return data;
};
