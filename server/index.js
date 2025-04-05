
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const pdfParse = require('pdf-parse');
const { createClient } = require('@supabase/supabase-js');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Supabase client
const supabaseUrl = 'https://meviqygiidqwiokddmup.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ldmlxeWdpaWRxd2lva2RkbXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0NTcyNjUsImV4cCI6MjA1ODAzMzI2NX0.pzVumUigkNNP3PN9b1g9GiEXFu8mCO38pZfBYiDng8s';
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for PDF file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
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

// API Routes for resumes
// Upload and analyze resume
app.post('/api/resumes/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { jobId, skillsWeight, experienceWeight } = req.body;
    
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }
    
    // Get the resume with job details
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', jobId)
      .single();
      
    if (resumeError) {
      return res.status(404).json({ error: 'Job details not found' });
    }
    
    // Extract resume info from PDF
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text;
    
    // Simple name extraction (look for name at beginning of resume)
    const nameMatch = resumeText.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/);
    const name = nameMatch ? nameMatch[0] : 'Unnamed Candidate';
    
    // Simple position extraction (look for common job titles)
    const positionMatch = resumeText.match(/(Software Engineer|Web Developer|Frontend Developer|Backend Developer|Full Stack Developer|UI\/UX Designer|Data Scientist|DevOps Engineer|Product Manager)/i);
    const position = positionMatch ? positionMatch[0] : 'Unspecified Position';
    
    // Simple keyword matching for skills analysis
    const skills = [
      'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js', 'Express', 
      'HTML', 'CSS', 'Python', 'Java', 'C#', 'PHP', 'Ruby', 'SQL', 'NoSQL', 
      'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes'
    ];
    
    const jobSkills = resume.job_description.match(new RegExp(skills.join('|'), 'gi')) || [];
    const resumeSkills = resumeText.match(new RegExp(skills.join('|'), 'gi')) || [];
    
    const matchedSkills = resumeSkills.filter(skill => 
      jobSkills.some(jobSkill => jobSkill.toLowerCase() === skill.toLowerCase())
    );
    
    const skillScore = Math.min(100, Math.round((matchedSkills.length / Math.max(1, jobSkills.length)) * 100));
    
    // Simple experience analysis (look for years/months)
    const experienceMatch = resumeText.match(/(\d+)\s*(year|yr|years|month|months)/gi);
    let totalMonths = 0;
    
    if (experienceMatch) {
      experienceMatch.forEach(match => {
        const [num, unit] = match.split(/\s+/);
        if (unit.toLowerCase().includes('year')) {
          totalMonths += parseInt(num) * 12;
        } else if (unit.toLowerCase().includes('month')) {
          totalMonths += parseInt(num);
        }
      });
    }
    
    const experienceScore = Math.min(100, Math.round((totalMonths / 60) * 100)); // Assuming 5 years (60 months) is ideal
    
    // Calculate overall score based on weights
    const sw = parseInt(skillsWeight) || resume.skills_weight || 50;
    const ew = parseInt(experienceWeight) || resume.experience_weight || 50;
    
    const overallScore = Math.round(
      (skillScore * (sw / 100)) +
      (experienceScore * (ew / 100))
    );
    
    // Get current reports to determine rank
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select('id, overall_score')
      .eq('resume_id', jobId)
      .order('overall_score', { ascending: false });
      
    if (reportsError) throw reportsError;
    
    // Determine rank based on overall score
    let rank = 1;
    if (reports && reports.length > 0) {
      const higherScores = reports.filter(r => r.overall_score > overallScore).length;
      rank = higherScores + 1;
    }
    
    // Prepare summary
    const summary = `Candidate has ${matchedSkills.length} relevant skills and approximately ${Math.round(totalMonths/12)} years of experience.`;
    
    // Create file URL (in a real app, you'd store the file in cloud storage)
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    // Save to reports table
    const { data: savedReport, error: saveError } = await supabase
      .from('reports')
      .insert([{
        resume_id: jobId,
        employee_name: name,
        position: position,
        skill_percentage: skillScore,
        skill_description: `Matched ${matchedSkills.length} out of ${jobSkills.length} required skills.`,
        experience_percentage: experienceScore,
        experience_description: `Approximately ${Math.round(totalMonths/12)} years of experience.`,
        overall_score: overallScore,
        resume_details: summary,
        candidate_rank: rank
      }])
      .select();
      
    if (saveError) throw saveError;
    
    // Update ranks of other reports if needed
    if (rank <= reports.length) {
      for (const report of reports) {
        if (report.overall_score <= overallScore) {
          await supabase
            .from('reports')
            .update({ candidate_rank: report.rank + 1 })
            .eq('id', report.id);
        }
      }
    }
    
    res.status(201).json(savedReport[0]);
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get reports by job ID (resume ID)
app.get('/api/resumes/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const { data: reports, error } = await supabase
      .from('reports')
      .select('*')
      .eq('resume_id', jobId)
      .order('candidate_rank', { ascending: true });
      
    if (error) throw error;
    
    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update report rank
app.put('/api/resumes/rank/:id/:direction', async (req, res) => {
  try {
    const { id, direction } = req.params;
    
    // Get the current report
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();
      
    if (reportError) throw reportError;
    
    // Find the report to swap ranks with
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select('*')
      .eq('resume_id', report.resume_id)
      .order('candidate_rank', { ascending: true });
      
    if (reportsError) throw reportsError;
    
    let swapReport;
    if (direction === 'up' && report.candidate_rank > 1) {
      swapReport = reports.find(r => r.candidate_rank === report.candidate_rank - 1);
    } else if (direction === 'down' && report.candidate_rank < reports.length) {
      swapReport = reports.find(r => r.candidate_rank === report.candidate_rank + 1);
    }
    
    if (swapReport) {
      // Swap ranks
      const { error: updateError1 } = await supabase
        .from('reports')
        .update({ candidate_rank: swapReport.candidate_rank })
        .eq('id', report.id);
        
      if (updateError1) throw updateError1;
      
      const { error: updateError2 } = await supabase
        .from('reports')
        .update({ candidate_rank: report.candidate_rank })
        .eq('id', swapReport.id);
        
      if (updateError2) throw updateError2;
      
      res.status(200).json({ message: 'Rank updated successfully' });
    } else {
      res.status(400).json({ error: 'Cannot change rank in that direction' });
    }
  } catch (error) {
    console.error('Error updating rank:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export the Supabase client for use in routes
module.exports = {
  supabase
};
