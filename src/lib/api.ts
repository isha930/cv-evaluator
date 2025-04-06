import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Resume-related functions
export const createJob = async (jobData: {
  title: string;
  description: string;
  skillsWeight: number;
  experienceWeight: number;
}) => {
  try {
    // Create a resume entry with job details
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
    console.log('Fetching jobs directly from Supabase...');
    // Direct Supabase query for resumes with job info
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .not('job_title', 'is', null)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Jobs data fetched:', data);
    
    // Map resumes with job_title to job objects
    const uniqueJobs = data
      .filter(resume => resume.job_title) // Filter out entries without job titles
      .map(resume => ({
        id: resume.id,
        title: resume.job_title,
        description: resume.job_description,
        skillsWeight: resume.skills_weight,
        experienceWeight: resume.experience_weight,
        createdAt: resume.created_at
      }));
    
    console.log('Formatted jobs:', uniqueJobs);
    return uniqueJobs;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    toast.error('Failed to fetch jobs');
    throw error;
  }
};

export const getJobById = async (jobId: string) => {
  try {
    console.log('Fetching job by ID:', jobId);
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', jobId)
      .single();
      
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Job fetched:', data);
    
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

// Resume upload and retrieval functions
export const uploadResume = async (formData: FormData) => {
  try {
    // Using Supabase directly instead of a custom API endpoint
    // Extract data from formData
    const jobId = formData.get('jobId') as string;
    const file = formData.get('resume') as File;
    
    if (!jobId || !file) {
      throw new Error('Missing required data');
    }
    
    // Get the job details to get weights
    const { data: jobData, error: jobError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', jobId)
      .single();
      
    if (jobError) throw jobError;
    
    // Upload the file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    
    const { data: storageData, error: storageError } = await supabase.storage
      .from('resumes')
      .upload(fileName, file);
      
    if (storageError) throw storageError;
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);
      
    const fileUrl = urlData.publicUrl;
    
    // Generate mock analysis based on random scores
    const skillScore = Math.floor(Math.random() * 41) + 60; // 60-100
    const experienceScore = Math.floor(Math.random() * 41) + 60; // 60-100
    
    // Calculate weighted score
    const overallScore = Math.round(
      (skillScore * (jobData.skills_weight / 100)) + 
      (experienceScore * (jobData.experience_weight / 100))
    );
    
    // Count existing reports to determine rank
    const { count, error: countError } = await supabase
      .from('reports')
      .select('*', { count: 'exact' })
      .eq('resume_id', jobId);
      
    if (countError) throw countError;
    
    // Create a sample candidate name
    const names = ['Alex Smith', 'Jordan Taylor', 'Casey Johnson', 'Morgan Williams', 'Riley Brown'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    
    // Create a sample position
    const positions = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'UI/UX Developer'];
    const randomPosition = positions[Math.floor(Math.random() * positions.length)];
    
    // Insert into reports
    const { data: reportData, error: reportError } = await supabase
      .from('reports')
      .insert({
        resume_id: jobId,
        employee_name: randomName,
        position: randomPosition,
        skill_percentage: skillScore,
        skill_description: `Candidate has demonstrated ${skillScore}% of the required skills.`,
        experience_percentage: experienceScore,
        experience_description: `Candidate has ${experienceScore}% relevant experience for this role.`,
        overall_score: overallScore,
        resume_details: `${randomName} is a ${randomPosition} with strong technical skills and relevant experience.`,
        candidate_rank: (count || 0) + 1
      })
      .select()
      .single();
      
    if (reportError) throw reportError;
    
    return {
      id: reportData.id,
      name: reportData.employee_name,
      position: reportData.position,
      skillScore: reportData.skill_percentage,
      experienceScore: reportData.experience_percentage,
      overallScore: reportData.overall_score,
      rank: reportData.candidate_rank
    };
  } catch (error) {
    console.error('Error uploading resume:', error);
    toast.error('Failed to upload resume');
    throw error;
  }
};

export const getResumesByJobId = async (jobId: string) => {
  try {
    console.log('Fetching resumes for job ID:', jobId);
    
    // Direct Supabase query for reports
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select('*')
      .eq('resume_id', jobId)
      .order('candidate_rank', { ascending: true });
      
    if (reportsError) {
      console.error('Supabase error:', reportsError);
      throw reportsError;
    }
    
    console.log('Reports fetched:', reports);
    
    if (!reports || reports.length === 0) {
      console.log('No reports found for this job ID');
      return [];
    }
    
    return reports.map(report => ({
      id: report.id,
      name: report.employee_name,
      position: report.position,
      skill_score: Number(report.skill_percentage),
      skill_description: report.skill_description,
      experience_score: Number(report.experience_percentage),
      experience_description: report.experience_description,
      overall_score: Number(report.overall_score),
      summary: report.resume_details || '',
      rank: report.candidate_rank || 0,
      file_url: '' // This would come from a join in a real implementation
    }));
  } catch (error) {
    console.error('Error fetching resumes:', error);
    toast.error('Failed to fetch resumes');
    throw error;
  }
};

// New function to get all reports regardless of job ID
export const getAllResumes = async () => {
  try {
    console.log('Fetching all resumes without job ID filter');
    
    // Direct Supabase query for all reports
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select('*')
      .order('candidate_rank', { ascending: true });
      
    if (reportsError) {
      console.error('Supabase error:', reportsError);
      throw reportsError;
    }
    
    console.log('All reports fetched:', reports);
    
    if (!reports || reports.length === 0) {
      console.log('No reports found in the database');
      return [];
    }
    
    return reports.map(report => ({
      id: report.id,
      name: report.employee_name,
      position: report.position,
      skill_score: Number(report.skill_percentage),
      skill_description: report.skill_description,
      experience_score: Number(report.experience_percentage),
      experience_description: report.experience_description,
      overall_score: Number(report.overall_score),
      summary: report.resume_details || '',
      rank: report.candidate_rank || 0,
      file_url: '',
      job_id: report.resume_id // Including the job ID for reference
    }));
  } catch (error) {
    console.error('Error fetching all resumes:', error);
    toast.error('Failed to fetch resumes');
    throw error;
  }
};

export const updateResumeRank = async (reportId: string, direction: 'up' | 'down') => {
  try {
    // First get the current report
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();
      
    if (reportError) throw reportError;
    
    // Get all reports for this resume
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select('*')
      .eq('resume_id', report.resume_id)
      .order('candidate_rank', { ascending: true });
      
    if (reportsError) throw reportsError;
    
    const currentIndex = reports.findIndex(r => r.id === reportId);
    let targetIndex;
    
    if (direction === 'up' && currentIndex > 0) {
      targetIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < reports.length - 1) {
      targetIndex = currentIndex + 1;
    } else {
      throw new Error('Cannot move in that direction');
    }
    
    // Swap ranks
    const currentRank = reports[currentIndex].candidate_rank || currentIndex + 1;
    const targetRank = reports[targetIndex].candidate_rank || targetIndex + 1;
    
    // Update ranks
    await supabase
      .from('reports')
      .update({ candidate_rank: targetRank })
      .eq('id', reportId);
      
    await supabase
      .from('reports')
      .update({ candidate_rank: currentRank })
      .eq('id', reports[targetIndex].id);
    
    return { success: true };
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
