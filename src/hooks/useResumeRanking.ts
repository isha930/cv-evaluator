
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getResumesByJobId, updateResumeRank, getJobById } from "@/lib/api";
import { ResumeData } from "@/components/ResumeCard";

// Define Resume type from the API
export interface Resume {
  id: string;
  name: string;
  position: string;
  skill_score: number;
  skill_description: string;
  experience_score: number;
  experience_description: string;
  overall_score: number;
  summary: string;
  rank: number;
  file_url?: string;
}

export const useResumeRanking = (jobId: string | null) => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobTitle, setJobTitle] = useState<string>("");
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (jobId) {
      fetchResumes();
      fetchJobDetails();
    } else {
      setIsLoading(false);
    }
  }, [jobId]);
  
  const fetchResumes = async () => {
    if (!jobId) return;
    
    try {
      setIsLoading(true);
      const data = await getResumesByJobId(jobId);
      setResumes(data);
    } catch (error) {
      console.error("Error fetching resumes:", error);
      toast.error("Failed to load resumes");
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchJobDetails = async () => {
    if (!jobId) return;
    
    try {
      const job = await getJobById(jobId);
      setJobTitle(job.title);
    } catch (error) {
      console.error("Error fetching job details:", error);
    }
  };
  
  const handleRankUp = async (id: string) => {
    try {
      await updateResumeRank(id, "up");
      
      // Optimistically update the UI
      const currentIndex = resumes.findIndex(resume => resume.id === id);
      if (currentIndex <= 0) return;
      
      const newResumes = [...resumes];
      // Swap ranks
      const currentRank = newResumes[currentIndex].rank;
      newResumes[currentIndex].rank = newResumes[currentIndex - 1].rank;
      newResumes[currentIndex - 1].rank = currentRank;
      
      // Sort by rank
      newResumes.sort((a, b) => a.rank - b.rank);
      
      setResumes(newResumes);
      toast.success("Candidate moved up in rankings");
    } catch (error) {
      console.error("Error updating rank:", error);
      toast.error("Failed to update ranking");
      // Refresh data to ensure UI is in sync with server
      fetchResumes();
    }
  };
  
  const handleRankDown = async (id: string) => {
    try {
      await updateResumeRank(id, "down");
      
      // Optimistically update the UI
      const currentIndex = resumes.findIndex(resume => resume.id === id);
      if (currentIndex >= resumes.length - 1) return;
      
      const newResumes = [...resumes];
      // Swap ranks
      const currentRank = newResumes[currentIndex].rank;
      newResumes[currentIndex].rank = newResumes[currentIndex + 1].rank;
      newResumes[currentIndex + 1].rank = currentRank;
      
      // Sort by rank
      newResumes.sort((a, b) => a.rank - b.rank);
      
      setResumes(newResumes);
      toast.success("Candidate moved down in rankings");
    } catch (error) {
      console.error("Error updating rank:", error);
      toast.error("Failed to update ranking");
      // Refresh data to ensure UI is in sync with server
      fetchResumes();
    }
  };
  
  const handleView = (id: string) => {
    const resume = resumes.find(r => r.id === id);
    if (resume) {
      setSelectedResume(resume);
      setIsDialogOpen(true);
    }
  };
  
  const handleExport = () => {
    // This could be expanded to create a CSV, PDF or other export format
    toast.success("Export feature will be implemented soon");
  };
  
  // Map API Resume format to ResumeData format for components
  const mapToResumeData = (resume: Resume): ResumeData => {
    return {
      id: resume.id,
      name: resume.name,
      position: resume.position,
      skillScore: resume.skill_score,
      experienceScore: resume.experience_score,
      overallScore: resume.overall_score,
      rank: resume.rank
    };
  };
  
  // Calculate statistics
  const getAverageScore = (): number => {
    if (resumes.length === 0) return 0;
    return Math.round(resumes.reduce((acc, r) => acc + r.overall_score, 0) / resumes.length);
  };
  
  return {
    resumes,
    resumeDataList: resumes.map(mapToResumeData),
    jobTitle,
    isLoading,
    selectedResume,
    isDialogOpen,
    setIsDialogOpen,
    handleRankUp,
    handleRankDown,
    handleView,
    handleExport,
    stats: {
      totalCandidates: resumes.length,
      averageScore: getAverageScore(),
      topPerformer: resumes[0]?.name || 'None'
    }
  };
};
