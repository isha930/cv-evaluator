
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getResumesByJobId, getJobById, updateResumeRank } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import RankingTable from "@/components/RankingTable";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import { cn } from "@/lib/utils";

const Ranking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const jobId = queryParams.get("jobId");
  const queryClient = useQueryClient();
  
  const [selectedResume, setSelectedResume] = useState(null);
  const [openResumeDialog, setOpenResumeDialog] = useState(false);
  
  const { data: job, isLoading: isJobLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJobById(jobId),
    enabled: !!jobId,
    onError: (error) => {
      toast.error(`Error loading job: ${error.message}`);
    }
  });
  
  const { data: resumes, isLoading } = useQuery({
    queryKey: ['resumes', jobId],
    queryFn: () => getResumesByJobId(jobId),
    enabled: !!jobId,
    onError: (error) => {
      toast.error(`Error loading resumes: ${error.message}`);
    }
  });
  
  const updateRankMutation = useMutation({
    mutationFn: ({ resumeId, direction }) => updateResumeRank(resumeId, direction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes', jobId] });
    },
    onError: (error) => {
      toast.error(`Error updating rank: ${error.message}`);
    }
  });
  
  const handleRankUp = (resumeId) => {
    updateRankMutation.mutate({ resumeId, direction: 'up' });
  };
  
  const handleRankDown = (resumeId) => {
    updateRankMutation.mutate({ resumeId, direction: 'down' });
  };
  
  const handleViewResume = (resumeId) => {
    const resume = resumes.find(r => r._id === resumeId);
    if (resume) {
      setSelectedResume(resume);
      setOpenResumeDialog(true);
    }
  };
  
  const scoreToColor = (score) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };
  
  const scoreToProgressColor = (score) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  if (isLoading || isJobLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container py-10">
          <div className="flex justify-center items-center h-[50vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading ranking data...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  if (!jobId || !resumes || resumes.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container py-10">
          <div className="flex flex-col items-center justify-center h-[50vh] text-center max-w-md mx-auto">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Ranking Data</h2>
            <p className="text-muted-foreground mb-6">
              {!jobId ? "No job selected. Please select a job to view rankings." : "No resumes found for this job. Upload some resumes to get started."}
            </p>
            <Button onClick={() => navigate('/upload')}>
              Upload Resumes
            </Button>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-6 md:py-10">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => navigate('/')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Resume Rankings</h1>
              </div>
              {job && (
                <p className="text-muted-foreground mt-1">
                  Job: <span className="font-medium text-foreground">{job.title}</span>
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/reports', { state: { jobId } })}
              >
                <FileText className="mr-2 h-4 w-4" />
                View Reports
              </Button>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export Rankings
              </Button>
            </div>
          </div>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Candidate Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <RankingTable 
                resumes={resumes}
                onRankUp={handleRankUp}
                onRankDown={handleRankDown}
                onView={handleViewResume}
              />
            </CardContent>
          </Card>
        </div>
        
        {selectedResume && (
          <Dialog open={openResumeDialog} onOpenChange={setOpenResumeDialog}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{selectedResume.name}</DialogTitle>
                <DialogDescription>
                  {selectedResume.position} • Rank: #{selectedResume.rank}
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="summary" className="mt-4">
                <TabsList className="mb-4">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary" className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Overall Score</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="text-3xl font-bold">
                            <span className={scoreToColor(selectedResume.overallScore)}>
                              {selectedResume.overallScore}%
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Rank #{selectedResume.rank} of {resumes.length}
                          </div>
                        </div>
                        <Progress 
                          value={selectedResume.overallScore} 
                          className={cn("h-2 mt-2", scoreToProgressColor(selectedResume.overallScore))} 
                        />
                      </CardContent>
                    </Card>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Skills</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <span className={cn("text-xl font-bold", scoreToColor(selectedResume.skillScore))}>
                              {selectedResume.skillScore}%
                            </span>
                            <span className="text-sm text-muted-foreground">
                              Weight: {job.skillsWeight}%
                            </span>
                          </div>
                          <Progress 
                            value={selectedResume.skillScore} 
                            className={cn("h-2 mt-1", scoreToProgressColor(selectedResume.skillScore))}
                          />
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Experience</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <span className={cn("text-xl font-bold", scoreToColor(selectedResume.experienceScore))}>
                              {selectedResume.experienceScore}%
                            </span>
                            <span className="text-sm text-muted-foreground">
                              Weight: {job.experienceWeight}%
                            </span>
                          </div>
                          <Progress 
                            value={selectedResume.experienceScore} 
                            className={cn("h-2 mt-1", scoreToProgressColor(selectedResume.experienceScore))}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Resume Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{selectedResume.summary}</p>
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => window.open(`http://localhost:5000${selectedResume.fileUrl}`, '_blank')}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          View Full Resume
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="skills" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Skills Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <span className={cn("text-2xl font-bold", scoreToColor(selectedResume.skillScore))}>
                          {selectedResume.skillScore}%
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Weight: {job.skillsWeight}%
                        </span>
                      </div>
                      <Progress 
                        value={selectedResume.skillScore} 
                        className={cn("h-2 mb-6", scoreToProgressColor(selectedResume.skillScore))}
                      />
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Skills Analysis</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedResume.skillDescription}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="experience" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Experience Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <span className={cn("text-2xl font-bold", scoreToColor(selectedResume.experienceScore))}>
                          {selectedResume.experienceScore}%
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Weight: {job.experienceWeight}%
                        </span>
                      </div>
                      <Progress 
                        value={selectedResume.experienceScore} 
                        className={cn("h-2 mb-6", scoreToProgressColor(selectedResume.experienceScore))}
                      />
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Experience Analysis</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedResume.experienceDescription}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
};

export default Ranking;
