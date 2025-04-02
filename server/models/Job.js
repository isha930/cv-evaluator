
// Job model for Supabase integration
// This file serves as a reference for Job table structure in Supabase

/*
Supabase Job Table Structure:
- id: uuid (primary key, auto-generated)
- title: text (not null)
- description: text (not null)
- skills_weight: integer (default: 50)
- experience_weight: integer (default: 50)
- created_at: timestamp with time zone (default: now())
- user_id: uuid (foreign key to auth.users)
*/

const createJobSchema = `
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  skills_weight INTEGER NOT NULL DEFAULT 50,
  experience_weight INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);
`;

module.exports = {
  createJobSchema,
  // Helper functions for Supabase Job operations
  formatJobForResponse: (job) => {
    return {
      id: job.id,
      title: job.title,
      description: job.description,
      skillsWeight: job.skills_weight,
      experienceWeight: job.experience_weight,
      createdAt: job.created_at,
      userId: job.user_id
    };
  },
  // Schema for inserting a new job
  getJobInsertData: (jobData) => {
    return {
      title: jobData.title,
      description: jobData.description,
      skills_weight: jobData.skillsWeight || 50,
      experience_weight: jobData.experienceWeight || 50,
      user_id: jobData.userId || null
    };
  }
};
