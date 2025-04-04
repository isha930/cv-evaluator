
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://meviqygiidqwiokddmup.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ldmlxeWdpaWRxd2lva2RkbXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0NTcyNjUsImV4cCI6MjA1ODAzMzI2NX0.pzVumUigkNNP3PN9b1g9GiEXFu8mCO38pZfBYiDng8s';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials. Please set proper Supabase URL and key.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Example of creating a job with the new database structure
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

// Create a report for a resume
export const createReport = async (reportData) => {
  const { data, error } = await supabase
    .from('reports')
    .insert({
      resume_id: reportData.resumeId,
      employee_name: reportData.name,
      position: reportData.position,
      skill_percentage: reportData.skillScore,
      skill_description: reportData.skillDescription,
      experience_percentage: reportData.experienceScore,
      experience_description: reportData.experienceDescription,
      overall_score: reportData.overallScore,
      resume_details: reportData.summary,
      candidate_rank: reportData.rank
    })
    .select();
  
  if (error) throw error;
  return data;
};

// Example of fetching jobs
export const getJobs = async () => {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .not('job_title', 'is', null);
  
  if (error) throw error;
  return data;
};

// Get reports for a specific resume
export const getReportsByResumeId = async (resumeId) => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('resume_id', resumeId)
    .order('candidate_rank', { ascending: true });
  
  if (error) throw error;
  return data;
};
