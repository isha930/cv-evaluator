
const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Resume = require('../models/Resume');

// Create a new job
router.post('/', async (req, res) => {
  try {
    const { title, description, skillsWeight, experienceWeight } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: 'Job title and description are required' });
    }
    
    const job = new Job({
      title,
      description,
      skillsWeight: skillsWeight || 50,
      experienceWeight: experienceWeight || 50
    });
    
    await job.save();
    res.status(201).json({ message: 'Job created successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Error creating job', error: error.message });
  }
});

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
});

// Get a specific job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job', error: error.message });
  }
});

// Update a job
router.put('/:id', async (req, res) => {
  try {
    const { title, description, skillsWeight, experienceWeight } = req.body;
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Update job details
    if (title) job.title = title;
    if (description) job.description = description;
    if (skillsWeight !== undefined) job.skillsWeight = skillsWeight;
    if (experienceWeight !== undefined) job.experienceWeight = experienceWeight;
    
    await job.save();
    
    // If weights were changed, recalculate all resumes' overall scores
    if (skillsWeight !== undefined || experienceWeight !== undefined) {
      const resumes = await Resume.find({ jobId: job._id });
      
      for (const resume of resumes) {
        const overallScore = Math.round(
          (resume.skillScore * (job.skillsWeight / 100)) +
          (resume.experienceScore * (job.experienceWeight / 100))
        );
        
        resume.overallScore = overallScore;
        await resume.save();
      }
      
      // Re-rank all resumes
      const updatedResumes = await Resume.find({ jobId: job._id })
        .sort({ overallScore: -1 });
        
      for (let i = 0; i < updatedResumes.length; i++) {
        await Resume.findByIdAndUpdate(updatedResumes[i]._id, { rank: i + 1 });
      }
    }
    
    res.status(200).json({ message: 'Job updated successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Error updating job', error: error.message });
  }
});

// Delete a job and all associated resumes
router.delete('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Delete all resumes associated with this job
    await Resume.deleteMany({ jobId: job._id });
    
    // Delete the job
    await Job.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Job and associated resumes deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job', error: error.message });
  }
});

module.exports = router;
