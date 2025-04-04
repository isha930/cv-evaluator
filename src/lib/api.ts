
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Job-related functions
export const createJob = async (jobData: {
  title: string;
  description: string;
  skillsWeight: number;
  experienceWeight: number;
}) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .insert([{
        title: jobData.title,
        description: jobData.description,
        skills_weight: jobData.skillsWeight,
        experience_weight: jobData.experienceWeight
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    return { 
      job: {
        id: data.id,
        title: data.title,
        description: data.description,
        skillsWeight: data.skills_weight,
        experienceWeight: data.experience_weight
      }
    };
  } catch (error) {
    console.error('Error creating job:', error);
    toast.error('Failed to create job');
    throw error;
  }
};

export const getJobs = async () => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      skillsWeight: job.skills_weight,
      experienceWeight: job.experience_weight,
      createdAt: job.created_at
    }));
  } catch (error) {
    console.error('Error fetching jobs:', error);
    toast.error('Failed to fetch jobs');
    throw error;
  }
};

export const getJobById = async (jobId: string) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      skillsWeight: data.skills_weight,
      experienceWeight: data.experience_weight,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Error fetching job:', error);
    toast.error('Failed to fetch job details');
    throw error;
  }
};

// Resume-related functions
export const uploadResume = async (formData: FormData) => {
  try {
    const response = await fetch('/api/resumes/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload resume');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading resume:', error);
    toast.error(error.message || 'Failed to upload resume');
    throw error;
  }
};

export const getResumesByJobId = async (jobId: string) => {
  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('job_id', jobId)
      .order('rank', { ascending: true });
      
    if (error) throw error;
    
    return data.map(resume => ({
      id: resume.id,
      name: resume.name || 'Unnamed',
      position: resume.position || 'Position not specified',
      skill_score: resume.skill_score || 0,
      skill_description: resume.skill_description || '',
      experience_score: resume.experience_score || 0,
      experience_description: resume.experience_description || '',
      overall_score: resume.overall_score || 0,
      summary: resume.summary || '',
      rank: resume.rank || 0,
      file_url: resume.file_url
    }));
  } catch (error) {
    console.error('Error fetching resumes:', error);
    toast.error('Failed to fetch resumes');
    throw error;
  }
};

export const updateResumeRank = async (resumeId: string, direction: 'up' | 'down') => {
  try {
    const response = await fetch(`/api/resumes/rank/${resumeId}/${direction}`, {
      method: 'PUT'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update rank');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating rank:', error);
    toast.error(error.message || 'Failed to update ranking');
    throw error;
  }
};

// Direct Supabase methods for when server endpoints aren't needed
export const updateResumeRankDirect = async (resumeId: string, newRank: number) => {
  try {
    const { data, error } = await supabase
      .from('resumes')
      .update({ rank: newRank })
      .eq('id', resumeId)
      .select();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating rank directly:', error);
    toast.error('Failed to update ranking');
    throw error;
  }
};

export const getResumeStats = async (jobId: string) => {
  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('skill_score, experience_score, overall_score')
      .eq('job_id', jobId);
      
    if (error) throw error;
    
    // Calculate statistics
    const totalCount = data.length;
    const avgSkillScore = totalCount > 0 
      ? Math.round(data.reduce((sum, r) => sum + (r.skill_score || 0), 0) / totalCount) 
      : 0;
    const avgExpScore = totalCount > 0 
      ? Math.round(data.reduce((sum, r) => sum + (r.experience_score || 0), 0) / totalCount) 
      : 0;
    const avgOverallScore = totalCount > 0 
      ? Math.round(data.reduce((sum, r) => sum + (r.overall_score || 0), 0) / totalCount) 
      : 0;
    
    return {
      totalCount,
      avgSkillScore,
      avgExpScore,
      avgOverallScore,
      highScoreCandidates: data.filter(r => r.overall_score >= 80).length,
      mediumScoreCandidates: data.filter(r => r.overall_score >= 60 && r.overall_score < 80).length,
      lowScoreCandidates: data.filter(r => r.overall_score < 60).length
    };
  } catch (error) {
    console.error('Error fetching resume statistics:', error);
    toast.error('Failed to fetch statistics');
    throw error;
  }
};
