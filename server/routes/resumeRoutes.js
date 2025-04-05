
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { supabase } = require('../index');
const { formatResumeForResponse, getResumeInsertData, formatReportForResponse, getReportInsertData } = require('../models/Resume');

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
    const skillsWeight = parseInt(req.body.skillsWeight) || 50;
    const experienceWeight = parseInt(req.body.experienceWeight) || 50;
    
    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }
    
    // Get the job details from the resumes table
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', jobId)
      .single();
      
    if (resumeError) {
      return res.status(404).json({ message: 'Job details not found' });
    }
    
    // Read the PDF file
    const pdfBuffer = fs.readFileSync(req.file.path);
    
    // Analyze the resume
    const analysisResult = await analyzeResume(
      pdfBuffer, 
      resume.job_description, 
      skillsWeight, 
      experienceWeight
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
    
    // Count existing reports to determine rank
    const { count, error: countError } = await supabase
      .from('reports')
      .select('*', { count: 'exact' })
      .eq('resume_id', jobId);
      
    if (countError) {
      console.error('Count error:', countError);
      throw countError;
    }
    
    // Create the report record
    const reportData = getReportInsertData({
      resumeId: jobId,
      name: candidateName || analysisResult.name,
      position: position || analysisResult.position,
      skillScore: analysisResult.skillScore,
      skillDescription: analysisResult.skillDescription,
      experienceScore: analysisResult.experienceScore,
      experienceDescription: analysisResult.experienceDescription,
      overallScore: analysisResult.overallScore,
      summary: analysisResult.summary,
      rank: count + 1  // New report gets next rank
    });
    
    // Insert the report data
    const { data: report, error: insertError } = await supabase
      .from('reports')
      .insert([reportData])
      .select()
      .single();
      
    if (insertError) {
      console.error('Insert error:', insertError);
      return res.status(500).json({ message: 'Error saving report data', error: insertError.message });
    }
    
    res.status(201).json({
      message: 'Resume uploaded and analyzed successfully',
      report: formatReportForResponse(report)
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ message: 'Error processing resume', error: error.message });
  }
});

// Get all reports for a specific job (resume)
router.get('/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const { data: reports, error } = await supabase
      .from('reports')
      .select('*')
      .eq('resume_id', jobId)
      .order('candidate_rank', { ascending: true });
      
    if (error) throw error;
    
    res.status(200).json(reports.map(report => formatReportForResponse(report)));
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching candidate reports', error: error.message });
  }
});

// Get a specific report
router.get('/:id', async (req, res) => {
  try {
    const { data: report, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', req.params.id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Report not found' });
      }
      throw error;
    }
    
    res.status(200).json(formatReportForResponse(report));
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ message: 'Error fetching report', error: error.message });
  }
});

// Update report ranking
router.put('/rank/:id/:direction', async (req, res) => {
  try {
    const { id, direction } = req.params;
    
    // Get the current report
    const { data: report, error: fetchError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();
      
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Report not found' });
      }
      throw fetchError;
    }
    
    const currentRank = report.candidate_rank;
    const newRank = direction === 'up' ? currentRank - 1 : currentRank + 1;
    
    if (newRank < 1) {
      return res.status(400).json({ message: 'Cannot move higher than rank 1' });
    }
    
    // Find report with the target rank
    const { data: targetReports, error: targetError } = await supabase
      .from('reports')
      .select('*')
      .eq('resume_id', report.resume_id)
      .eq('candidate_rank', newRank);
      
    if (targetError) throw targetError;
    
    if (targetReports && targetReports.length > 0) {
      const targetReport = targetReports[0];
      
      // Swap ranks (update target report's rank)
      const { error: swapError } = await supabase
        .from('reports')
        .update({ candidate_rank: currentRank })
        .eq('id', targetReport.id);
        
      if (swapError) throw swapError;
    }
    
    // Update current report's rank
    const { data: updatedReport, error: updateError } = await supabase
      .from('reports')
      .update({ candidate_rank: newRank })
      .eq('id', id)
      .select()
      .single();
      
    if (updateError) throw updateError;
    
    res.status(200).json({ 
      message: 'Rank updated successfully', 
      report: formatReportForResponse(updatedReport) 
    });
  } catch (error) {
    console.error('Error updating rank:', error);
    res.status(500).json({ message: 'Error updating rank', error: error.message });
  }
});

// Delete a report
router.delete('/:id', async (req, res) => {
  try {
    // Get the report to delete
    const { data: report, error: fetchError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', req.params.id)
      .single();
      
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Report not found' });
      }
      throw fetchError;
    }
    
    // Delete the report from the database
    const { error: deleteError } = await supabase
      .from('reports')
      .delete()
      .eq('id', req.params.id);
      
    if (deleteError) throw deleteError;
    
    // Re-rank remaining reports
    const { data: remainingReports, error: rankingError } = await supabase
      .from('reports')
      .select('*')
      .eq('resume_id', report.resume_id)
      .order('overall_score', { ascending: false });
      
    if (rankingError) throw rankingError;
    
    // Update ranks
    for (let i = 0; i < remainingReports.length; i++) {
      await supabase
        .from('reports')
        .update({ candidate_rank: i + 1 })
        .eq('id', remainingReports[i].id);
    }
    
    res.status(200).json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ message: 'Error deleting report', error: error.message });
  }
});

module.exports = router;
