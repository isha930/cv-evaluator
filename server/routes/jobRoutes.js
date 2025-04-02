
const express = require('express');
const router = express.Router();
const { supabase } = require('../index');
const { formatJobForResponse, getJobInsertData } = require('../models/Job');
const { formatResumeForResponse } = require('../models/Resume');

// Create a new job
router.post('/', async (req, res) => {
  try {
    const { title, description, skillsWeight, experienceWeight } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: 'Job title and description are required' });
    }
    
    const jobData = getJobInsertData({
      title,
      description,
      skillsWeight: skillsWeight || 50,
      experienceWeight: experienceWeight || 50
    });
    
    const { data: job, error } = await supabase
      .from('jobs')
      .insert([jobData])
      .select()
      .single();
      
    if (error) throw error;
    
    res.status(201).json({ 
      message: 'Job created successfully', 
      job: formatJobForResponse(job) 
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Error creating job', error: error.message });
  }
});

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    res.status(200).json(jobs.map(job => formatJobForResponse(job)));
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
});

// Get a specific job
router.get('/:id', async (req, res) => {
  try {
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', req.params.id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Job not found' });
      }
      throw error;
    }
    
    res.status(200).json(formatJobForResponse(job));
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ message: 'Error fetching job', error: error.message });
  }
});

// Update a job
router.put('/:id', async (req, res) => {
  try {
    const { title, description, skillsWeight, experienceWeight } = req.body;
    
    // Get current job data
    const { data: job, error: fetchError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', req.params.id)
      .single();
      
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Job not found' });
      }
      throw fetchError;
    }
    
    // Update job details
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (skillsWeight !== undefined) updateData.skills_weight = skillsWeight;
    if (experienceWeight !== undefined) updateData.experience_weight = experienceWeight;
    
    const { data: updatedJob, error: updateError } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();
      
    if (updateError) throw updateError;
    
    // If weights were changed, recalculate all resumes' overall scores
    if (skillsWeight !== undefined || experienceWeight !== undefined) {
      const { data: resumes, error: resumesError } = await supabase
        .from('resumes')
        .select('*')
        .eq('job_id', req.params.id);
        
      if (resumesError) throw resumesError;
      
      // Update each resume's overall score
      for (const resume of resumes) {
        const newSkillsWeight = skillsWeight !== undefined ? skillsWeight : job.skills_weight;
        const newExperienceWeight = experienceWeight !== undefined ? experienceWeight : job.experience_weight;
        
        const overallScore = Math.round(
          (resume.skill_score * (newSkillsWeight / 100)) +
          (resume.experience_score * (newExperienceWeight / 100))
        );
        
        await supabase
          .from('resumes')
          .update({ overall_score: overallScore })
          .eq('id', resume.id);
      }
      
      // Re-rank all resumes
      const { data: updatedResumes, error: rankError } = await supabase
        .from('resumes')
        .select('*')
        .eq('job_id', req.params.id)
        .order('overall_score', { ascending: false });
        
      if (rankError) throw rankError;
      
      for (let i = 0; i < updatedResumes.length; i++) {
        await supabase
          .from('resumes')
          .update({ rank: i + 1 })
          .eq('id', updatedResumes[i].id);
      }
    }
    
    res.status(200).json({ 
      message: 'Job updated successfully', 
      job: formatJobForResponse(updatedJob) 
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Error updating job', error: error.message });
  }
});

// Delete a job and all associated resumes
router.delete('/:id', async (req, res) => {
  try {
    // First check if job exists
    const { data: job, error: fetchError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', req.params.id)
      .single();
      
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Job not found' });
      }
      throw fetchError;
    }
    
    // Delete all resumes associated with this job
    const { error: resumeDeleteError } = await supabase
      .from('resumes')
      .delete()
      .eq('job_id', req.params.id);
      
    if (resumeDeleteError) throw resumeDeleteError;
    
    // Delete the job
    const { error: jobDeleteError } = await supabase
      .from('jobs')
      .delete()
      .eq('id', req.params.id);
      
    if (jobDeleteError) throw jobDeleteError;
    
    res.status(200).json({ message: 'Job and associated resumes deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Error deleting job', error: error.message });
  }
});

module.exports = router;
