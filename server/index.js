
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

// API Routes

// Create a new job
app.post('/api/jobs', async (req, res) => {
  try {
    const { title, description, skillsWeight, experienceWeight } = req.body;
    
    const { data: job, error } = await supabase
      .from('jobs')
      .insert([{
        title,
        description,
        skills_weight: skillsWeight,
        experience_weight: experienceWeight
      }])
      .select();
      
    if (error) throw error;
    
    res.status(201).json({ job: job[0] });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get job by ID
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    res.status(200).json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload and analyze resume
app.post('/api/resumes/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { jobId } = req.body;
    
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }
    
    // Get job details to use for analysis
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();
      
    if (jobError) throw jobError;
    
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
    
    const jobSkills = job.description.match(new RegExp(skills.join('|'), 'gi')) || [];
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
    const overallScore = Math.round(
      (skillScore * (job.skills_weight / 100)) +
      (experienceScore * (job.experience_weight / 100))
    );
    
    // Get current resumes to determine rank
    const { data: resumes, error: resumesError } = await supabase
      .from('resumes')
      .select('id, overall_score')
      .eq('job_id', jobId)
      .order('overall_score', { ascending: false });
      
    if (resumesError) throw resumesError;
    
    // Determine rank based on overall score
    let rank = 1;
    if (resumes && resumes.length > 0) {
      const higherScores = resumes.filter(r => r.overall_score > overallScore).length;
      rank = higherScores + 1;
    }
    
    // Prepare summary
    const summary = `Candidate has ${matchedSkills.length} relevant skills and approximately ${Math.round(totalMonths/12)} years of experience.`;
    
    // Create file URL (in a real app, you'd store the file in cloud storage)
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    // Save resume to database
    const { data: savedResume, error: saveError } = await supabase
      .from('resumes')
      .insert([{
        name,
        position,
        file_path: req.file.path,
        file_name: req.file.originalname,
        file_url: fileUrl,
        skill_score: skillScore,
        skill_description: `Matched ${matchedSkills.length} out of ${jobSkills.length} required skills.`,
        experience_score: experienceScore,
        experience_description: `Approximately ${Math.round(totalMonths/12)} years of experience.`,
        overall_score: overallScore,
        summary,
        job_id: jobId,
        rank
      }])
      .select();
      
    if (saveError) throw saveError;
    
    // Update ranks of other resumes if needed
    if (rank <= resumes.length) {
      for (const resume of resumes) {
        if (resume.overall_score <= overallScore) {
          await supabase
            .from('resumes')
            .update({ rank: resume.rank + 1 })
            .eq('id', resume.id);
        }
      }
    }
    
    res.status(201).json(savedResume[0]);
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get resumes by job ID
app.get('/api/resumes/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const { data: resumes, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('job_id', jobId)
      .order('rank', { ascending: true });
      
    if (error) throw error;
    
    res.status(200).json(resumes);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update resume rank
app.put('/api/resumes/rank/:id/:direction', async (req, res) => {
  try {
    const { id, direction } = req.params;
    
    // Get the current resume
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', id)
      .single();
      
    if (resumeError) throw resumeError;
    
    // Find the resume to swap ranks with
    const { data: resumes, error: resumesError } = await supabase
      .from('resumes')
      .select('*')
      .eq('job_id', resume.job_id)
      .order('rank', { ascending: true });
      
    if (resumesError) throw resumesError;
    
    let swapResume;
    if (direction === 'up' && resume.rank > 1) {
      swapResume = resumes.find(r => r.rank === resume.rank - 1);
    } else if (direction === 'down' && resume.rank < resumes.length) {
      swapResume = resumes.find(r => r.rank === resume.rank + 1);
    }
    
    if (swapResume) {
      // Swap ranks
      const { error: updateError1 } = await supabase
        .from('resumes')
        .update({ rank: swapResume.rank })
        .eq('id', resume.id);
        
      if (updateError1) throw updateError1;
      
      const { error: updateError2 } = await supabase
        .from('resumes')
        .update({ rank: resume.rank })
        .eq('id', swapResume.id);
        
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
