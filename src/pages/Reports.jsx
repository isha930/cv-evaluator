
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getResumesByJobId, getJobById } from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ArrowLeft, Download, FileText, Printer } from "lucide-react";
import { toast } from "sonner";
import { generatePDF } from "@/utils/printUtils";
import Navigation from "@/components/Navigation";

const Reports = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const queryParams = new URLSearchParams(location.search);
  const jobId = state?.jobId || queryParams.get("jobId");
  
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
  
  const [topCandidates, setTopCandidates] = useState([]);
  const [skillsDistribution, setSkillsDistribution] = useState([]);
  const [experienceDistribution, setExperienceDistribution] = useState([]);
  const [overallDistribution, setOverallDistribution] = useState([]);
  
  useEffect(() => {
    if (resumes && resumes.length > 0) {
      // Top candidates
      const sorted = [...resumes].sort((a, b) => b.overallScore - a.overallScore);
      setTopCandidates(sorted.slice(0, 5));
      
      // Skills distribution
      const skillsData = [
        { name: '90-100%', value: resumes.filter(r => r.skillScore >= 90).length },
        { name: '70-89%', value: resumes.filter(r => r.skillScore >= 70 && r.skillScore < 90).length },
        { name: '50-69%', value: resumes.filter(r => r.skillScore >= 50 && r.skillScore < 70).length },
        { name: '0-49%', value: resumes.filter(r => r.skillScore < 50).length },
      ];
      setSkillsDistribution(skillsData);
      
      // Experience distribution
      const experienceData = [
        { name: '90-100%', value: resumes.filter(r => r.experienceScore >= 90).length },
        { name: '70-89%', value: resumes.filter(r => r.experienceScore >= 70 && r.experienceScore < 90).length },
        { name: '50-69%', value: resumes.filter(r => r.experienceScore >= 50 && r.experienceScore < 70).length },
        { name: '0-49%', value: resumes.filter(r => r.experienceScore < 50).length },
      ];
      setExperienceDistribution(experienceData);
      
      // Overall distribution
      const overallData = [
        { name: '90-100%', value: resumes.filter(r => r.overallScore >= 90).length },
        { name: '70-89%', value: resumes.filter(r => r.overallScore >= 70 && r.overallScore < 90).length },
        { name: '50-69%', value: resumes.filter(r => r.overallScore >= 50 && r.overallScore < 70).length },
        { name: '0-49%', value: resumes.filter(r => r.overallScore < 50).length },
      ];
      setOverallDistribution(overallData);
    }
  }, [resumes]);
  
  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];
  
  const handlePrint = () => {
    if (!resumes || !job) return;
    
    generatePDF(resumes, job.title);
    toast.success('PDF report is being generated');
  };
  
  if (isLoading || isJobLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container py-10">
          <div className="flex justify-center items-center h-[50vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading report data...</p>
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
            <h2 className="text-2xl font-bold mb-2">No Report Data</h2>
            <p className="text-muted-foreground mb-6">
              {!jobId ? "No job selected. Please select a job to view reports." : "No resumes found for this job. Upload some resumes to generate reports."}
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
                  onClick={() => navigate('/ranking', { state: { jobId } })}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Resume Analysis Reports</h1>
              </div>
              {job && (
                <p className="text-muted-foreground mt-1">
                  Job: <span className="font-medium text-foreground">{job.title}</span>
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print Report
              </Button>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
              <TabsTrigger value="experience">Experience Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Total Candidates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{resumes.length}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Average Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {Math.round(resumes.reduce((acc, curr) => acc + curr.overallScore, 0) / resumes.length)}%
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Top Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-500">
                      {Math.max(...resumes.map(r => r.overallScore))}%
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Qualified (>70%)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {resumes.filter(r => r.overallScore >= 70).length}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Score Distribution</CardTitle>
                    <CardDescription>
                      Distribution of overall scores for all candidates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            ...topCandidates.map(candidate => ({
                              name: candidate.name,
                              Skills: candidate.skillScore,
                              Experience: candidate.experienceScore,
                              Overall: candidate.overallScore
                            }))
                          ]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="Skills" fill="#3b82f6" />
                          <Bar dataKey="Experience" fill="#22c55e" />
                          <Bar dataKey="Overall" fill="#f59e0b" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Overall Score Distribution</CardTitle>
                    <CardDescription>
                      Breakdown of candidates by score range
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={overallDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {overallDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Ranked Candidates</CardTitle>
                  <CardDescription>
                    The highest scoring candidates for the position
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase text-muted-foreground">
                        <tr>
                          <th scope="col" className="px-4 py-3">Rank</th>
                          <th scope="col" className="px-4 py-3">Name</th>
                          <th scope="col" className="px-4 py-3">Position</th>
                          <th scope="col" className="px-4 py-3">Skills</th>
                          <th scope="col" className="px-4 py-3">Experience</th>
                          <th scope="col" className="px-4 py-3">Overall</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topCandidates.map((candidate, index) => (
                          <tr key={candidate._id} className="border-b">
                            <td className="px-4 py-3 font-medium">{candidate.rank}</td>
                            <td className="px-4 py-3 font-medium">{candidate.name}</td>
                            <td className="px-4 py-3">{candidate.position}</td>
                            <td className="px-4 py-3">{candidate.skillScore}%</td>
                            <td className="px-4 py-3">{candidate.experienceScore}%</td>
                            <td className="px-4 py-3 font-medium">{candidate.overallScore}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => navigate('/ranking', { state: { jobId } })}
                  >
                    View All Candidates
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="skills" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Skills Distribution</CardTitle>
                    <CardDescription>
                      Breakdown of candidates by skills score range
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={skillsDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {skillsDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Skills Stats</CardTitle>
                    <CardDescription>
                      Analysis of candidates' skills scores
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Average Skills Score</span>
                          <span className="font-medium">{Math.round(resumes.reduce((acc, curr) => acc + curr.skillScore, 0) / resumes.length)}%</span>
                        </div>
                        <div className="bg-muted h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-500 h-full rounded-full"
                            style={{ width: `${Math.round(resumes.reduce((acc, curr) => acc + curr.skillScore, 0) / resumes.length)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Highest Skills Score</span>
                          <span className="font-medium">{Math.max(...resumes.map(r => r.skillScore))}%</span>
                        </div>
                        <div className="bg-muted h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-green-500 h-full rounded-full"
                            style={{ width: `${Math.max(...resumes.map(r => r.skillScore))}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Lowest Skills Score</span>
                          <span className="font-medium">{Math.min(...resumes.map(r => r.skillScore))}%</span>
                        </div>
                        <div className="bg-muted h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-red-500 h-full rounded-full"
                            style={{ width: `${Math.min(...resumes.map(r => r.skillScore))}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Candidates with Skills Score > 70%</span>
                          <span className="font-medium">{resumes.filter(r => r.skillScore > 70).length} ({Math.round((resumes.filter(r => r.skillScore > 70).length / resumes.length) * 100)}%)</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Candidates by Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase text-muted-foreground">
                        <tr>
                          <th scope="col" className="px-4 py-3">Name</th>
                          <th scope="col" className="px-4 py-3">Skills Score</th>
                          <th scope="col" className="px-4 py-3">Skills Details</th>
                          <th scope="col" className="px-4 py-3">Overall Rank</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...resumes]
                          .sort((a, b) => b.skillScore - a.skillScore)
                          .slice(0, 5)
                          .map((candidate) => (
                            <tr key={candidate._id} className="border-b">
                              <td className="px-4 py-3 font-medium">{candidate.name}</td>
                              <td className="px-4 py-3">{candidate.skillScore}%</td>
                              <td className="px-4 py-3 max-w-md truncate">{candidate.skillDescription}</td>
                              <td className="px-4 py-3">{candidate.rank}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="experience" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Experience Distribution</CardTitle>
                    <CardDescription>
                      Breakdown of candidates by experience score range
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={experienceDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {experienceDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Experience Stats</CardTitle>
                    <CardDescription>
                      Analysis of candidates' experience scores
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Average Experience Score</span>
                          <span className="font-medium">{Math.round(resumes.reduce((acc, curr) => acc + curr.experienceScore, 0) / resumes.length)}%</span>
                        </div>
                        <div className="bg-muted h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-green-500 h-full rounded-full"
                            style={{ width: `${Math.round(resumes.reduce((acc, curr) => acc + curr.experienceScore, 0) / resumes.length)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Highest Experience Score</span>
                          <span className="font-medium">{Math.max(...resumes.map(r => r.experienceScore))}%</span>
                        </div>
                        <div className="bg-muted h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-green-500 h-full rounded-full"
                            style={{ width: `${Math.max(...resumes.map(r => r.experienceScore))}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Lowest Experience Score</span>
                          <span className="font-medium">{Math.min(...resumes.map(r => r.experienceScore))}%</span>
                        </div>
                        <div className="bg-muted h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-red-500 h-full rounded-full"
                            style={{ width: `${Math.min(...resumes.map(r => r.experienceScore))}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Candidates with Experience Score > 70%</span>
                          <span className="font-medium">{resumes.filter(r => r.experienceScore > 70).length} ({Math.round((resumes.filter(r => r.experienceScore > 70).length / resumes.length) * 100)}%)</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Candidates by Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase text-muted-foreground">
                        <tr>
                          <th scope="col" className="px-4 py-3">Name</th>
                          <th scope="col" className="px-4 py-3">Experience Score</th>
                          <th scope="col" className="px-4 py-3">Experience Details</th>
                          <th scope="col" className="px-4 py-3">Overall Rank</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...resumes]
                          .sort((a, b) => b.experienceScore - a.experienceScore)
                          .slice(0, 5)
                          .map((candidate) => (
                            <tr key={candidate._id} className="border-b">
                              <td className="px-4 py-3 font-medium">{candidate.name}</td>
                              <td className="px-4 py-3">{candidate.experienceScore}%</td>
                              <td className="px-4 py-3 max-w-md truncate">{candidate.experienceDescription}</td>
                              <td className="px-4 py-3">{candidate.rank}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Reports;
