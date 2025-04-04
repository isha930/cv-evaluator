
// Resume model for Supabase integration
// This file serves as a reference for Resume and Report tables structure in Supabase

/*
Supabase Resume Table Structure:
- id: uuid (primary key, auto-generated)
- user_id: uuid (required)
- file_name: text (not null)
- file_url: text (not null)
- job_title: text (nullable)
- job_description: text (nullable)
- skills_weight: integer (nullable, default: 50)
- experience_weight: integer (nullable, default: 50)
- created_at: timestamp with time zone (default: now())
- updated_at: timestamp with time zone (default: now())
*/

/*
Supabase Report Table Structure:
- id: uuid (primary key, auto-generated)
- resume_id: uuid (foreign key to resumes table)
- employee_name: text (default: 'Unknown')
- position: text (default: 'Not Specified')
- skill_percentage: numeric (not null, default: 0)
- skill_description: text (default: 'No skill description available')
- experience_percentage: numeric (not null, default: 0)
- experience_description: text (default: 'No experience description available')
- overall_score: numeric (not null, default: 0)
- resume_details: text (nullable)
- candidate_rank: integer (nullable)
- created_at: timestamp (default: now())
- updated_at: timestamp (default: now())
*/

const createResumeSchema = `
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL DEFAULT 'NOT NULL',
  file_url TEXT NOT NULL DEFAULT 'NOT NULL',
  job_title TEXT,
  job_description TEXT,
  skills_weight INTEGER DEFAULT 50,
  experience_weight INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

const createReportSchema = `
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES resumes(id),
  employee_name TEXT NOT NULL DEFAULT 'Unknown',
  position TEXT NOT NULL DEFAULT 'Not Specified',
  skill_percentage NUMERIC NOT NULL DEFAULT 0,
  skill_description TEXT NOT NULL DEFAULT 'No skill description available',
  experience_percentage NUMERIC NOT NULL DEFAULT 0,
  experience_description TEXT NOT NULL DEFAULT 'No experience description available',
  overall_score NUMERIC NOT NULL DEFAULT 0,
  resume_details TEXT,
  candidate_rank INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
`;

module.exports = {
  createResumeSchema,
  createReportSchema,
  // Helper functions for Resume table
  formatResumeForResponse: (resume) => {
    return {
      id: resume.id,
      jobTitle: resume.job_title,
      jobDescription: resume.job_description,
      fileName: resume.file_name, 
      fileUrl: resume.file_url,
      skillsWeight: resume.skills_weight,
      experienceWeight: resume.experience_weight,
      createdAt: resume.created_at,
      userId: resume.user_id
    };
  },
  // Schema for inserting a new resume
  getResumeInsertData: (resumeData) => {
    return {
      user_id: resumeData.userId || '00000000-0000-0000-0000-000000000000',
      file_name: resumeData.fileName,
      file_url: resumeData.fileUrl,
      job_title: resumeData.jobTitle,
      job_description: resumeData.jobDescription,
      skills_weight: resumeData.skillsWeight || 50,
      experience_weight: resumeData.experienceWeight || 50
    };
  },
  // Helper functions for Report table
  formatReportForResponse: (report) => {
    return {
      id: report.id,
      resumeId: report.resume_id,
      name: report.employee_name,
      position: report.position,
      skillScore: report.skill_percentage,
      skillDescription: report.skill_description,
      experienceScore: report.experience_percentage,
      experienceDescription: report.experience_description,
      overallScore: report.overall_score,
      summary: report.resume_details,
      rank: report.candidate_rank,
      createdAt: report.created_at
    };
  },
  // Schema for inserting a new report
  getReportInsertData: (reportData) => {
    return {
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
    };
  }
};
