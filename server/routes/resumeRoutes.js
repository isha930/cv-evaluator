
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const pdfParse = require('pdf-parse');
const { supabase } = require('../index');
const { formatResumeForResponse, getResumeInsertData } = require('../models/Resume');

// Configure multer for PDF file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

// Helper function to analyze resume content
const analyzeResume = async (pdfBuffer, jobDescription, skillsWeight, experienceWeight) => {
  try {
    const data = await pdfParse(pdfBuffer);
    const resumeText = data.text.toLowerCase();
    const jobKeywords = jobDescription.toLowerCase().split(' ');
    
    // Simple keyword matching for skills analysis
    const skillsKeywords = ['javascript', 'react', 'node', 'express', 'mongodb', 'database', 'frontend', 'backend', 'fullstack', 'css', 'html', 'api', 'rest', 'graphql', 'typescript'];
    let skillsMatched = 0;
    let matchedSkills = [];
    
    skillsKeywords.forEach(keyword => {
      if (resumeText.includes(keyword)) {
        skillsMatched++;
        matchedSkills.push(keyword);
      }
    });
    
    const skillScore = Math.min(100, Math.round((skillsMatched / skillsKeywords.length) * 100));
    
    // Experience analysis (years, relevant experience)
    const experienceRegex = /(\d+)[\s-]*(year|yr|years|yrs)/gi;
    const experienceMatches = resumeText.match(experienceRegex);
    
    let totalYears = 0;
    if (experienceMatches) {
      experienceMatches.forEach(match => {
        const yearNum = parseInt(match.match(/\d+/)[0]);
        totalYears = Math.max(totalYears, yearNum); // Take the highest year mention
      });
    }
    
    let experienceScore = 0;
    if (totalYears >= 10) experienceScore = 100;
    else if (totalYears >= 7) experienceScore = 85;
    else if (totalYears >= 5) experienceScore = 75;
    else if (totalYears >= 3) experienceScore = 65;
    else if (totalYears >= 1) experienceScore = 50;
    else experienceScore = 30;
    
    // Calculate overall score based on weights
    const overallScore = Math.round((skillScore * (skillsWeight / 100)) + 
                               (experienceScore * (experienceWeight / 100)));
    
    // Extract name and position (simplified approach)
    const namePositionRegex = /([A-Z][a-z]+ [A-Z][a-z]+)/g;
    const nameMatches = resumeText.match(namePositionRegex);
    let name = nameMatches ? nameMatches[0] : 'Unnamed Candidate';
    
    // Position extraction (simplified)
    const positionKeywords = ['developer', 'engineer', 'manager', 'designer', 'analyst'];
    let position = 'Unknown Position';
    for (const keyword of positionKeywords) {
      if (resumeText.includes(keyword)) {
        const posRegex = new RegExp(`[a-z]+ ${keyword}`, 'i');
        const posMatch = resumeText.match(posRegex);
        if (posMatch) {
          position = posMatch[0];
          break;
        }
      }
    }
    
    // Generate summaries
    const skillDescription = matchedSkills.length > 0 
      ? `Matched skills: ${matchedSkills.join(', ')}`
      : 'No specific skills detected';
      
    const experienceDescription = totalYears > 0
      ? `Approximately ${totalYears} years of experience detected`
      : 'No clear experience information found';
      
    // Extract summary (first ~200 chars that aren't header material)
    let summary = '';
    const contentStart = resumeText.indexOf('\n\n');
    if (contentStart > -1) {
      summary = resumeText.substring(contentStart, contentStart + 300)
                        .replace(/\n+/g, ' ').trim();
    } else {
      summary = resumeText.substring(0, 300).replace(/\n+/g, ' ').trim();
    }
    
    if (summary.length > 200) {
      summary = summary.substring(0, 197) + '...';
    }
    
    return {
      skillScore,
      skillDescription,
      experienceScore,
      experienceDescription,
      overallScore,
      name,
      position,
      summary
    };
  } catch (error) {
    console.error('Error analyzing resume:', error);
    return {
      skillScore: 0,
      skillDescription: 'Error analyzing skills',
      experienceScore: 0, 
      experienceDescription: 'Error analyzing experience',
      overallScore: 0,
      name: 'Processing Error',
      position: 'Unknown',
      summary: 'There was an error processing this resume'
    };
  }
};

// Upload and analyze a resume
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No resume file uploaded' });
    }
    
    const { jobId, candidateName, position } = req.body;
    
    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }
    
    // Get the job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();
      
    if (jobError) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Read the PDF file
    const pdfBuffer = fs.readFileSync(req.file.path);
    
    // Analyze the resume
    const analysisResult = await analyzeResume(
      pdfBuffer, 
      job.description, 
      job.skills_weight, 
      job.experience_weight
    );
    
    // Upload file to Supabase Storage
    const fileExt = path.extname(req.file.originalname);
    const fileName = `${Date.now()}${fileExt}`;
    const filePath = req.file.path;
    
    const fileBuffer = fs.readFileSync(filePath);
    
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('resumes')
      .upload(fileName, fileBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600'
      });
      
    if (storageError) {
      console.error('Storage error:', storageError);
      return res.status(500).json({ message: 'Error uploading file to storage', error: storageError.message });
    }
    
    // Get public URL for the file
    const { data: publicUrlData } = supabase
      .storage
      .from('resumes')
      .getPublicUrl(fileName);
      
    const publicUrl = publicUrlData.publicUrl;
    
    // Create the resume record with complete data
    const resumeData = getResumeInsertData({
      name: candidateName || analysisResult.name,
      position: position || analysisResult.position,
      filePath: filePath,
      fileName: req.file.originalname,
      fileUrl: publicUrl,
      skillScore: analysisResult.skillScore,
      skillDescription: analysisResult.skillDescription,
      experienceScore: analysisResult.experienceScore,
      experienceDescription: analysisResult.experienceDescription,
      overallScore: analysisResult.overallScore,
      summary: analysisResult.summary,
      jobId: job.id,
      rank: 0  // Will update this after inserting
    });
    
    // Insert the resume data
    const { data: resume, error: insertError } = await supabase
      .from('resumes')
      .insert([resumeData])
      .select()
      .single();
      
    if (insertError) {
      console.error('Insert error:', insertError);
      return res.status(500).json({ message: 'Error saving resume data', error: insertError.message });
    }
    
    // Update ranks for all resumes of this job
    const { data: allResumes, error: rankingError } = await supabase
      .from('resumes')
      .select('*')
      .eq('job_id', job.id)
      .order('overall_score', { ascending: false });
      
    if (rankingError) {
      console.error('Ranking error:', rankingError);
      return res.status(500).json({ message: 'Error updating resume ranks', error: rankingError.message });
    }
    
    // Update each resume's rank
    for (let i = 0; i < allResumes.length; i++) {
      await supabase
        .from('resumes')
        .update({ rank: i + 1 })
        .eq('id', allResumes[i].id);
    }
    
    // Get the updated resume record with the correct rank
    const { data: updatedResume, error: fetchError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resume.id)
      .single();
      
    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return res.status(500).json({ message: 'Error fetching updated resume', error: fetchError.message });
    }
    
    res.status(201).json({
      message: 'Resume uploaded and analyzed successfully',
      resume: formatResumeForResponse(updatedResume)
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ message: 'Error processing resume', error: error.message });
  }
});

// Get all resumes for a specific job
router.get('/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const { data: resumes, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('job_id', jobId)
      .order('rank', { ascending: true });
      
    if (error) throw error;
    
    res.status(200).json(resumes.map(resume => formatResumeForResponse(resume)));
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({ message: 'Error fetching resumes', error: error.message });
  }
});

// Get a specific resume
router.get('/:id', async (req, res) => {
  try {
    const { data: resume, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', req.params.id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Resume not found' });
      }
      throw error;
    }
    
    res.status(200).json(formatResumeForResponse(resume));
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ message: 'Error fetching resume', error: error.message });
  }
});

// Update resume ranking
router.put('/rank/:id/:direction', async (req, res) => {
  try {
    const { id, direction } = req.params;
    
    // Get the current resume
    const { data: resume, error: fetchError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', id)
      .single();
      
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Resume not found' });
      }
      throw fetchError;
    }
    
    const currentRank = resume.rank;
    const newRank = direction === 'up' ? currentRank - 1 : currentRank + 1;
    
    if (newRank < 1) {
      return res.status(400).json({ message: 'Cannot move higher than rank 1' });
    }
    
    // Find resume with the target rank
    const { data: targetResumes, error: targetError } = await supabase
      .from('resumes')
      .select('*')
      .eq('job_id', resume.job_id)
      .eq('rank', newRank);
      
    if (targetError) throw targetError;
    
    if (targetResumes && targetResumes.length > 0) {
      const targetResume = targetResumes[0];
      
      // Swap ranks (update target resume's rank)
      const { error: swapError } = await supabase
        .from('resumes')
        .update({ rank: currentRank })
        .eq('id', targetResume.id);
        
      if (swapError) throw swapError;
    }
    
    // Update current resume's rank
    const { data: updatedResume, error: updateError } = await supabase
      .from('resumes')
      .update({ rank: newRank })
      .eq('id', id)
      .select()
      .single();
      
    if (updateError) throw updateError;
    
    res.status(200).json({ 
      message: 'Rank updated successfully', 
      resume: formatResumeForResponse(updatedResume) 
    });
  } catch (error) {
    console.error('Error updating rank:', error);
    res.status(500).json({ message: 'Error updating rank', error: error.message });
  }
});

// Delete a resume
router.delete('/:id', async (req, res) => {
  try {
    // Get the resume to delete
    const { data: resume, error: fetchError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', req.params.id)
      .single();
      
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Resume not found' });
      }
      throw fetchError;
    }
    
    // Delete the file from storage if it exists
    if (resume.file_url) {
      const fileName = resume.file_url.split('/').pop();
      await supabase
        .storage
        .from('resumes')
        .remove([fileName]);
    }
    
    // Delete the resume from the database
    const { error: deleteError } = await supabase
      .from('resumes')
      .delete()
      .eq('id', req.params.id);
      
    if (deleteError) throw deleteError;
    
    // Re-rank remaining resumes
    const { data: remainingResumes, error: rankingError } = await supabase
      .from('resumes')
      .select('*')
      .eq('job_id', resume.job_id)
      .order('overall_score', { ascending: false });
      
    if (rankingError) throw rankingError;
    
    // Update ranks
    for (let i = 0; i < remainingResumes.length; i++) {
      await supabase
        .from('resumes')
        .update({ rank: i + 1 })
        .eq('id', remainingResumes[i].id);
    }
    
    res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ message: 'Error deleting resume', error: error.message });
  }
});

module.exports = router;
