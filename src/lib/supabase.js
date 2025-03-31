
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with the correct project URL and anon key
const supabaseUrl = 'https://meviqygiidqwiokddmup.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ldmlxeWdpaWRxd2lva2RkbXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0NTcyNjUsImV4cCI6MjA1ODAzMzI2NX0.pzVumUigkNNP3PN9b1g9GiEXFu8mCO38pZfBYiDng8s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Resume management functions
export const uploadMultipleResumes = async (files, userId, jobData) => {
  if (!files || files.length === 0) return { error: 'No files provided' };
  
  const uploadResults = [];
  const errors = [];
  
  for (const file of files) {
    // Create a unique filename
    const fileName = `${userId || 'anonymous'}_${Date.now()}_${file.name}`;
    
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(fileName, file);
      
    if (error) {
      errors.push({ file: file.name, error });
      continue;
    }
    
    // Get the public URL for the file
    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);
      
    if (urlData) {
      // Save resume data to the database
      const resumeData = {
        user_id: userId || 'anonymous',
        file_name: file.name,
        file_url: urlData.publicUrl,
        job_title: jobData.jobTitle,
        job_description: jobData.jobDescription,
        skills_weight: jobData.skillsWeight,
        experience_weight: jobData.experienceWeight,
        education_weight: jobData.educationWeight
      };
      
      const { data: savedData, error: saveError } = await supabase
        .from('resumes')
        .insert([resumeData])
        .select();
        
      if (saveError) {
        errors.push({ file: file.name, error: saveError });
      } else {
        uploadResults.push({
          file: file.name,
          data: { ...data, ...savedData[0], publicUrl: urlData.publicUrl }
        });
      }
    }
  }
  
  return { 
    results: uploadResults, 
    errors: errors.length > 0 ? errors : null 
  };
};

// Function to save job description data to the database
export const saveJobDescription = async (jobData) => {
  const { data, error } = await supabase
    .from('jobs')
    .insert([jobData])
    .select();
    
  return { data, error };
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
export const getUserJobs = async (userId) => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  return { data, error };
};
