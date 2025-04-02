
// Resume model for Supabase integration
// This file serves as a reference for Resume table structure in Supabase

/*
Supabase Resume Table Structure:
- id: uuid (primary key, auto-generated)
- name: text (not null)
- position: text (not null)
- file_path: text (not null)
- file_name: text (not null)
- file_url: text (not null)
- skill_score: integer (default: 0)
- skill_description: text (default: '')
- experience_score: integer (default: 0)
- experience_description: text (default: '')
- overall_score: integer (default: 0)
- summary: text (default: '')
- job_id: uuid (foreign key to jobs table)
- rank: integer (default: 0)
- created_at: timestamp with time zone (default: now())
- user_id: uuid (foreign key to auth.users)
*/

const createResumeSchema = `
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  skill_score INTEGER NOT NULL DEFAULT 0,
  skill_description TEXT DEFAULT '',
  experience_score INTEGER NOT NULL DEFAULT 0,
  experience_description TEXT DEFAULT '',
  overall_score INTEGER NOT NULL DEFAULT 0,
  summary TEXT DEFAULT '',
  job_id UUID REFERENCES jobs(id) NOT NULL,
  rank INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);
`;

module.exports = {
  createResumeSchema,
  // Helper functions for Supabase Resume operations
  formatResumeForResponse: (resume) => {
    return {
      id: resume.id,
      name: resume.name,
      position: resume.position,
      filePath: resume.file_path,
      fileName: resume.file_name, 
      fileUrl: resume.file_url,
      skillScore: resume.skill_score,
      skillDescription: resume.skill_description,
      experienceScore: resume.experience_score,
      experienceDescription: resume.experience_description,
      overallScore: resume.overall_score,
      summary: resume.summary,
      jobId: resume.job_id,
      rank: resume.rank,
      createdAt: resume.created_at,
      userId: resume.user_id
    };
  },
  // Schema for inserting a new resume
  getResumeInsertData: (resumeData) => {
    return {
      name: resumeData.name,
      position: resumeData.position,
      file_path: resumeData.filePath,
      file_name: resumeData.fileName,
      file_url: resumeData.fileUrl,
      skill_score: resumeData.skillScore || 0,
      skill_description: resumeData.skillDescription || '',
      experience_score: resumeData.experienceScore || 0,
      experience_description: resumeData.experienceDescription || '',
      overall_score: resumeData.overallScore || 0,
      summary: resumeData.summary || '',
      job_id: resumeData.jobId,
      rank: resumeData.rank || 0,
      user_id: resumeData.userId || null
    };
  }
};
