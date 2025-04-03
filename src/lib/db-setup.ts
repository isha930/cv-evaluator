
import { supabase } from "@/integrations/supabase/client";

export const setupDemoData = async () => {
  try {
    // First, sign up a demo user if not exists
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email: 'demo@resumeanalyzer.com',
      password: 'DemoUser2024!',
    });

    if (signUpError && signUpError.message !== 'User already exists') {
      console.error('Error signing up demo user:', signUpError);
      throw signUpError;
    }

    // If user exists, retrieve the user ID
    const userId = user?.id || '';

    // Add jobs associated with this user
    const { data: jobsData, error: jobsError } = await supabase
      .from('jobs')
      .insert([
        {
          title: 'Frontend Developer', 
          description: 'We are looking for a skilled frontend developer proficient in React, TypeScript, and responsive design.',
          user_id: userId
        },
        {
          title: 'Backend Engineer', 
          description: 'Looking for a backend engineer with experience in Node.js, Express, and database design.',
          user_id: userId
        },
        {
          title: 'Full Stack Developer', 
          description: 'We need a full stack developer with knowledge of both frontend and backend technologies.',
          user_id: userId
        }
      ]);

    if (jobsError) {
      console.error('Error inserting jobs:', jobsError);
      throw jobsError;
    }

    console.log('Demo data setup complete');
    return { user, jobs: jobsData };
  } catch (error) {
    console.error('Error in setupDemoData:', error);
    throw error;
  }
};
