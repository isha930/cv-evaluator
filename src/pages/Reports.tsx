
import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  Printer, 
  Download, 
  Share2,
  FileSpreadsheet,
} from "lucide-react";
import {
  Bar,
  BarChart as RechartBarChart,
  Cell,
  Legend,
  Line,
  LineChart as RechartLineChart,
  Pie,
  PieChart as RechartPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { getJobs, getResumesByJobId } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [resumes, setResumes] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    avgSkillScore: 0,
    avgExpScore: 0,
    avgOverallScore: 0,
    highScoreCandidates: 0,
    mediumScoreCandidates: 0,
    lowScoreCandidates: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch jobs on component mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsData = await getJobs();
        setJobs(jobsData);
        
        // If jobs exist, select the first one by default
        if (jobsData.length > 0) {
          setSelectedJobId(jobsData[0].id);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchJobs();
  }, []);
  
  // Fetch resumes when selected job changes
  useEffect(() => {
    if (!selectedJobId) return;
    
    const fetchResumes = async () => {
      try {
        setIsLoading(true);
        const resumesData = await getResumesByJobId(selectedJobId);
        setResumes(resumesData);
        
        // Calculate statistics
        if (resumesData.length > 0) {
          const totalCount = resumesData.length;
          const avgSkillScore = Math.round(resumesData.reduce((acc, r) => acc + r.skill_score, 0) / totalCount);
          const avgExpScore = Math.round(resumesData.reduce((acc, r) => acc + r.experience_score, 0) / totalCount);
          const avgOverallScore = Math.round(resumesData.reduce((acc, r) => acc + r.overall_score, 0) / totalCount);
          
          const highScoreCandidates = resumesData.filter(r => r.overall_score >= 80).length;
          const mediumScoreCandidates = resumesData.filter(r => r.overall_score >= 60 && r.overall_score < 80).length;
          const lowScoreCandidates = resumesData.filter(r => r.overall_score < 60).length;
          
          setStats({
            totalCount,
            avgSkillScore,
            avgExpScore,
            avgOverallScore,
            highScoreCandidates,
            mediumScoreCandidates,
            lowScoreCandidates
          });
        }
      } catch (error) {
        console.error("Error fetching resumes or stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResumes();
  }, [selectedJobId]);
  
  // Prepare chart data
  const skillDistributionData = [
    { name: "High (80-100%)", value: resumes.filter(r => r.skill_score >= 80).length },
    { name: "Medium (60-79%)", value: resumes.filter(r => r.skill_score >= 60 && r.skill_score < 80).length },
    { name: "Low (40-59%)", value: resumes.filter(r => r.skill_score >= 40 && r.skill_score < 60).length },
    { name: "Poor (0-39%)", value: resumes.filter(r => r.skill_score < 40).length },
  ];
  
  const experienceDistributionData = [
    { name: "High (80-100%)", value: resumes.filter(r => r.experience_score >= 80).length },
    { name: "Medium (60-79%)", value: resumes.filter(r => r.experience_score >= 60 && r.experience_score < 80).length },
    { name: "Low (40-59%)", value: resumes.filter(r => r.experience_score >= 40 && r.experience_score < 60).length },
    { name: "Poor (0-39%)", value: resumes.filter(r => r.experience_score < 40).length },
  ];
  
  const overallDistributionData = [
    { name: "High (80-100%)", value: resumes.filter(r => r.overall_score >= 80).length },
    { name: "Medium (60-79%)", value: resumes.filter(r => r.overall_score >= 60 && r.overall_score < 80).length },
    { name: "Low (40-59%)", value: resumes.filter(r => r.overall_score >= 40 && r.overall_score < 60).length },
    { name: "Poor (0-39%)", value: resumes.filter(r => r.overall_score < 40).length },
  ];
  
  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"];
  
  // Function handlers for buttons
  const handleExport = () => {
    toast.success("Export feature will be implemented soon");
  };
  
  const handleShare = () => {
    toast.success("Share feature will be implemented soon");
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-7xl mx-auto fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Candidate Reports</h1>
              <p className="text-muted-foreground">
                Comprehensive overview of candidate evaluations and metrics
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
          
          <div className="mb-6">
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Select a job position" />
              </SelectTrigger>
              <SelectContent>
                {jobs.map(job => (
                  <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading data...</p>
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg shadow-subtle border">
              <h3 className="text-xl font-medium mb-2">No Data Available</h3>
              <p className="text-muted-foreground mb-4">
                There are no resumes uploaded for this job position yet.
              </p>
              <Button onClick={() => window.location.href = '/upload'}>
                Upload Resumes
              </Button>
            </div>
          ) : (
            <Tabs 
              defaultValue="overview" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid grid-cols-3 md:w-auto w-full">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
                <TabsTrigger value="experience">Experience Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Total Candidates</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {stats.totalCount}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Average Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {stats.avgOverallScore}%
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Qualified (&gt;70%)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {resumes.filter(r => r.overall_score > 70).length}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Top Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {resumes.length > 0 ? Math.max(...resumes.map(r => r.overall_score)) : 0}%
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="shadow-subtle">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Overall Score Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartPieChart>
                          <Pie
                            data={overallDistributionData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            labelLine={true}
                            label
                          >
                            {overallDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RechartPieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-subtle">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Score Comparison</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartBarChart 
                          data={[
                            { name: "Skills", score: stats.avgSkillScore },
                            { name: "Experience", score: stats.avgExpScore },
                            { name: "Overall", score: stats.avgOverallScore }
                          ]}
                        >
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Bar dataKey="score" fill="#3B82F6" />
                        </RechartBarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="shadow-subtle">
                  <CardHeader>
                    <CardTitle>Candidate Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">Rank</th>
                            <th className="text-left py-3 px-4">Candidate</th>
                            <th className="text-left py-3 px-4">Position</th>
                            <th className="text-left py-3 px-4">Skills</th>
                            <th className="text-left py-3 px-4">Experience</th>
                            <th className="text-left py-3 px-4">Overall</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resumes.slice(0, 5).map((resume, index) => (
                            <tr key={resume.id} className="border-b hover:bg-muted/50">
                              <td className="py-3 px-4">#{resume.rank}</td>
                              <td className="py-3 px-4 font-medium">{resume.name}</td>
                              <td className="py-3 px-4">{resume.position}</td>
                              <td className="py-3 px-4">{resume.skill_score}%</td>
                              <td className="py-3 px-4">{resume.experience_score}%</td>
                              <td className="py-3 px-4">{resume.overall_score}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {resumes.length > 5 && (
                      <div className="mt-4 text-center">
                        <Button variant="outline" onClick={() => window.location.href = `/ranking?jobId=${selectedJobId}`}>
                          View All Candidates
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="skills" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="shadow-subtle">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Skills Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartPieChart>
                          <Pie
                            data={skillDistributionData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            labelLine={true}
                            label
                          >
                            {skillDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RechartPieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-subtle">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Skills Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Average Skills Score</span>
                          <span className="font-medium">{stats.avgSkillScore}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-blue-600 rounded-full h-2" style={{ width: `${stats.avgSkillScore}%` }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Candidates with Skills Score &gt;70%</span>
                          <span className="font-medium">{resumes.filter(r => r.skill_score > 70).length} ({Math.round((resumes.filter(r => r.skill_score > 70).length / resumes.length) * 100)}%)</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h3 className="text-lg font-medium mb-2">Top Candidates by Skills</h3>
                        <div className="space-y-2">
                          {resumes.sort((a, b) => b.skill_score - a.skill_score).slice(0, 3).map(resume => (
                            <div key={resume.id} className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{resume.name}</p>
                                <p className="text-sm text-muted-foreground">{resume.position}</p>
                              </div>
                              <div className="text-lg font-bold">{resume.skill_score}%</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Skills Details</CardTitle>
                      <Button variant="outline" size="sm">
                        <FileSpreadsheet className="h-4 w-4 mr-1" />
                        Export Data
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">Candidate</th>
                            <th className="text-left py-3 px-4">Position</th>
                            <th className="text-left py-3 px-4">Skills Score</th>
                            <th className="text-left py-3 px-4">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resumes.map((resume) => (
                            <tr key={resume.id} className="border-b hover:bg-muted/50">
                              <td className="py-3 px-4 font-medium">{resume.name}</td>
                              <td className="py-3 px-4">{resume.position}</td>
                              <td className="py-3 px-4">{resume.skill_score}%</td>
                              <td className="py-3 px-4 max-w-md truncate">{resume.skill_description}</td>
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
                  <Card className="shadow-subtle">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Experience Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartPieChart>
                          <Pie
                            data={experienceDistributionData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            labelLine={true}
                            label
                          >
                            {experienceDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RechartPieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-subtle">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Experience Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Average Experience Score</span>
                          <span className="font-medium">{stats.avgExpScore}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-green-600 rounded-full h-2" style={{ width: `${stats.avgExpScore}%` }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Candidates with Experience Score &gt;70%</span>
                          <span className="font-medium">{resumes.filter(r => r.experience_score > 70).length} ({Math.round((resumes.filter(r => r.experience_score > 70).length / resumes.length) * 100)}%)</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h3 className="text-lg font-medium mb-2">Top Candidates by Experience</h3>
                        <div className="space-y-2">
                          {resumes.sort((a, b) => b.experience_score - a.experience_score).slice(0, 3).map(resume => (
                            <div key={resume.id} className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{resume.name}</p>
                                <p className="text-sm text-muted-foreground">{resume.position}</p>
                              </div>
                              <div className="text-lg font-bold">{resume.experience_score}%</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Experience Details</CardTitle>
                      <Button variant="outline" size="sm">
                        <FileSpreadsheet className="h-4 w-4 mr-1" />
                        Export Data
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">Candidate</th>
                            <th className="text-left py-3 px-4">Position</th>
                            <th className="text-left py-3 px-4">Experience Score</th>
                            <th className="text-left py-3 px-4">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resumes.map((resume) => (
                            <tr key={resume.id} className="border-b hover:bg-muted/50">
                              <td className="py-3 px-4 font-medium">{resume.name}</td>
                              <td className="py-3 px-4">{resume.position}</td>
                              <td className="py-3 px-4">{resume.experience_score}%</td>
                              <td className="py-3 px-4 max-w-md truncate">{resume.experience_description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
};

export default Reports;
