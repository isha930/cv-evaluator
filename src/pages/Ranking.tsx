
import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import RankingTable from "@/components/RankingTable";
import ResumeCard, { ResumeData } from "@/components/ResumeCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Download, Share2 } from "lucide-react";

const Ranking = () => {
  const [selectedResume, setSelectedResume] = useState<ResumeData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Mock data
  const [resumes, setResumes] = useState<ResumeData[]>([
    {
      id: "1",
      name: "John Smith",
      position: "Senior Frontend Developer",
      skillScore: 92,
      experienceScore: 85,
      educationScore: 78,
      overallScore: 87,
      rank: 1,
    },
    {
      id: "2",
      name: "Emily Johnson",
      position: "UX/UI Designer",
      skillScore: 88,
      experienceScore: 76,
      educationScore: 90,
      overallScore: 85,
      rank: 2,
    },
    {
      id: "3",
      name: "Michael Chen",
      position: "Full Stack Developer",
      skillScore: 85,
      experienceScore: 82,
      educationScore: 75,
      overallScore: 82,
      rank: 3,
    },
    {
      id: "4",
      name: "Anna Williams",
      position: "Product Manager",
      skillScore: 70,
      experienceScore: 90,
      educationScore: 80,
      overallScore: 80,
      rank: 4,
    },
    {
      id: "5",
      name: "Robert Garcia",
      position: "Backend Developer",
      skillScore: 90,
      experienceScore: 65,
      educationScore: 72,
      overallScore: 76,
      rank: 5,
    },
    {
      id: "6",
      name: "Sarah Lee",
      position: "Data Scientist",
      skillScore: 80,
      experienceScore: 60,
      educationScore: 95,
      overallScore: 75,
      rank: 6,
    },
    {
      id: "7",
      name: "David Wilson",
      position: "DevOps Engineer",
      skillScore: 78,
      experienceScore: 72,
      educationScore: 65,
      overallScore: 73,
      rank: 7,
    }
  ]);
  
  const handleRankUp = (id: string) => {
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
  };
  
  const handleRankDown = (id: string) => {
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
  };
  
  const handleView = (id: string) => {
    const resume = resumes.find(r => r.id === id);
    if (resume) {
      setSelectedResume(resume);
      setIsDialogOpen(true);
    }
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
                Current rankings based on your criteria for <span className="font-medium">Senior Frontend Developer</span>
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
          
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
                      compact
                      onView={() => handleView(resume.id)}
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
                      {Math.round(resumes.reduce((acc, r) => acc + r.overallScore, 0) / resumes.length)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Top Performer</span>
                    <span className="font-medium">{resumes[0].name}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Skills</h4>
                  <div className="text-2xl font-semibold">{selectedResume.skillScore}%</div>
                  <p className="text-sm text-muted-foreground">
                    Based on keyword matching and required technical capabilities
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Experience</h4>
                  <div className="text-2xl font-semibold">{selectedResume.experienceScore}%</div>
                  <p className="text-sm text-muted-foreground">
                    Based on years of relevant experience and previous roles
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Education</h4>
                  <div className="text-2xl font-semibold">{selectedResume.educationScore}%</div>
                  <p className="text-sm text-muted-foreground">
                    Based on degrees, certifications, and relevant training
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Resume Details</h4>
                <p className="text-muted-foreground text-sm">
                  This is a placeholder for the actual resume content. In a real application, 
                  this would display the parsed content from the resume, highlighting relevant 
                  skills, experience, and education that contributed to the candidate's scores.
                </p>
              </div>
              
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
