
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import RankingTable from "@/components/RankingTable";
import ResumeCard from "@/components/ResumeCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Download, Share2 } from "lucide-react";
import { getResumesByJobId, updateResumeRank, getJobById } from "@/lib/api";

// Define Resume type
interface Resume {
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

const Ranking = () => {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");
  
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobTitle, setJobTitle] = useState<string>("");
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch resumes on component mount
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
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-5xl mx-auto fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Resume Rankings</h1>
              <p className="text-muted-foreground">
                Current rankings based on your criteria for <span className="font-medium">{jobTitle || "This Job"}</span>
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading resumes...</p>
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg shadow-subtle border">
              <h3 className="text-xl font-medium mb-2">No Resumes Found</h3>
              <p className="text-muted-foreground mb-4">
                {jobId 
                  ? "There are no resumes uploaded for this job position yet."
                  : "Please select a job to view its resume rankings."}
              </p>
              <Button onClick={() => window.location.href = '/upload'}>
                Upload Resumes
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              <div className="xl:col-span-8 overflow-auto bg-card rounded-lg shadow-subtle border">
                <RankingTable 
                  resumes={resumes}
                  onRankUp={handleRankUp}
                  onRankDown={handleRankDown}
                  onView={handleView}
                />
              </div>
              
              <div className="xl:col-span-4 space-y-6">
                <div className="bg-card rounded-lg p-4 shadow-subtle border">
                  <h3 className="font-medium mb-3">Top Candidates</h3>
                  <div className="space-y-4">
                    {resumes.slice(0, 3).map(resume => (
                      <ResumeCard 
                        key={resume.id}
                        resume={resume}
                        compact={true}
                        onView={() => handleView(resume.id)}
                        onRankUp={() => {}}
                        onRankDown={() => {}}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="bg-card rounded-lg p-4 shadow-subtle border">
                  <h3 className="font-medium mb-2">Ranking Overview</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Candidates</span>
                      <span className="font-medium">{resumes.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average Score</span>
                      <span className="font-medium">
                        {Math.round(resumes.reduce((acc, r) => acc + r.overall_score, 0) / resumes.length)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Top Performer</span>
                      <span className="font-medium">{resumes[0]?.name || 'None'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          {selectedResume && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedResume.name}</DialogTitle>
                <DialogDescription>{selectedResume.position}</DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Skills</h4>
                  <div className="text-2xl font-semibold">{selectedResume.skill_score}%</div>
                  <p className="text-sm text-muted-foreground">
                    {selectedResume.skill_description}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Experience</h4>
                  <div className="text-2xl font-semibold">{selectedResume.experience_score}%</div>
                  <p className="text-sm text-muted-foreground">
                    {selectedResume.experience_description}
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Resume Summary</h4>
                <p className="text-muted-foreground text-sm">
                  {selectedResume.summary || 
                    "This is a placeholder for the resume summary. In a real application, this would display the parsed content from the resume."}
                </p>
              </div>
              
              {selectedResume.file_url && (
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => window.open(selectedResume.file_url, '_blank')}
                    className="w-full"
                  >
                    View Original Resume
                  </Button>
                </div>
              )}
              
              <div className="mt-4 flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    handleRankUp(selectedResume.id);
                    setIsDialogOpen(false);
                  }}
                  disabled={selectedResume.rank <= 1}
                >
                  Move Up
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleRankDown(selectedResume.id);
                    setIsDialogOpen(false);
                  }}
                >
                  Move Down
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Ranking;
