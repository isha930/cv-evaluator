
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// These keys should be replaced with your actual Supabase URL and anon key
// NOTE: For production, these should be stored in environment variables
const supabaseUrl = 'https://your-supabase-project-url.supabase.co';
const supabaseAnonKey = 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication functions
export const signUp = async (email, password, userData = {}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData, // Additional user metadata
    },
  });
  
  return { data, error };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { user: data?.user, error };
};

// Resume management functions
export const uploadResume = async (file, userId) => {
  if (!file) return { error: 'No file provided' };
  
  // Create a unique filename
  const fileName = `${userId}_${Date.now()}_${file.name}`;
  
  // Upload file to Supabase Storage
  const { data, error } = await supabase.storage
    .from('resumes')
    .upload(fileName, file);
    
  if (error) return { error };
  
  // Get the public URL for the file
  const { data: urlData } = supabase.storage
    .from('resumes')
    .getPublicUrl(fileName);
    
  return { data: { ...data, publicUrl: urlData.publicUrl }, error: null };
};

// Function to save resume data to the database
export const saveResumeData = async (resumeData) => {
  const { data, error } = await supabase
    .from('resumes')
    .insert([resumeData])
    .select();
    
  return { data, error };
};

// Function to get all resumes for a user
export const getUserResumes = async (userId) => {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  return { data, error };
};

// Function to get a single resume by id
export const getResumeById = async (resumeId) => {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .single();
    
  return { data, error };
};

// Function to update resume data (including rank)
export const updateResume = async (resumeId, updateData) => {
  const { data, error } = await supabase
    .from('resumes')
    .update(updateData)
    .eq('id', resumeId)
    .select();
    
  return { data, error };
};

// Function to delete a resume
export const deleteResume = async (resumeId) => {
  const { error } = await supabase
    .from('resumes')
    .delete()
    .eq('id', resumeId);
    
  return { error };
};

// Job management functions
export const saveJobDescription = async (jobData) => {
  const { data, error } = await supabase
    .from('jobs')
    .insert([jobData])
    .select();
    
  return { data, error };
};

export const getUserJobs = async (userId) => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  return { data, error };
};
