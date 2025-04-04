
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
      .from('resumes')
      .insert({
        job_title: jobData.title,
        job_description: jobData.description,
        skills_weight: jobData.skillsWeight,
        experience_weight: jobData.experienceWeight,
        user_id: '00000000-0000-0000-0000-000000000000' // Default user ID for now
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return { 
      job: {
        id: data.id,
        title: data.job_title,
        description: data.job_description,
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
      .from('resumes')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Group by job_title to get unique jobs
    const uniqueJobs = data.reduce((acc, resume) => {
      if (resume.job_title && !acc.some(job => job.title === resume.job_title)) {
        acc.push({
          id: resume.id,
          title: resume.job_title,
          description: resume.job_description,
          skillsWeight: resume.skills_weight,
          experienceWeight: resume.experience_weight,
          createdAt: resume.created_at
        });
      }
      return acc;
    }, []);
    
    return uniqueJobs;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    toast.error('Failed to fetch jobs');
    throw error;
  }
};

export const getJobById = async (jobId: string) => {
  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', jobId)
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.job_title,
      description: data.job_description,
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
    // First get the job details
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', jobId)
      .single();
      
    if (resumeError) throw resumeError;
    
    // Then get the related reports
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select('*')
      .eq('resume_id', jobId)
      .order('candidate_rank', { ascending: true });
      
    if (reportsError) throw reportsError;
    
    return reports.map(report => ({
      id: report.id,
      name: report.employee_name,
      position: report.position,
      skill_score: report.skill_percentage,
      skill_description: report.skill_description,
      experience_score: report.experience_percentage,
      experience_description: report.experience_description,
      overall_score: report.overall_score,
      summary: report.resume_details || '',
      rank: report.candidate_rank || 0,
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
export const updateResumeRankDirect = async (reportId: string, newRank: number) => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .update({ candidate_rank: newRank })
      .eq('id', reportId)
      .select();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating rank directly:', error);
    toast.error('Failed to update ranking');
    throw error;
  }
};

// Add the missing getResumeStats function
export const getResumeStats = async (jobId: string) => {
  try {
    // Get reports for this resume
    const { data, error } = await supabase
      .from('reports')
      .select('skill_percentage, experience_percentage, overall_score')
      .eq('resume_id', jobId);
      
    if (error) throw error;
    
    // Calculate statistics
    const totalCount = data.length;
    const avgSkillScore = totalCount > 0 
      ? Math.round(data.reduce((sum, r) => sum + Number(r.skill_percentage || 0), 0) / totalCount) 
      : 0;
    const avgExpScore = totalCount > 0 
      ? Math.round(data.reduce((sum, r) => sum + Number(r.experience_percentage || 0), 0) / totalCount) 
      : 0;
    const avgOverallScore = totalCount > 0 
      ? Math.round(data.reduce((sum, r) => sum + Number(r.overall_score || 0), 0) / totalCount) 
      : 0;
    
    return {
      totalCount,
      avgSkillScore,
      avgExpScore,
      avgOverallScore,
      highScoreCandidates: data.filter(r => Number(r.overall_score) >= 80).length,
      mediumScoreCandidates: data.filter(r => Number(r.overall_score) >= 60 && Number(r.overall_score) < 80).length,
      lowScoreCandidates: data.filter(r => Number(r.overall_score) < 60).length
    };
  } catch (error) {
    console.error('Error fetching resume statistics:', error);
    toast.error('Failed to fetch statistics');
    throw error;
  }
};
