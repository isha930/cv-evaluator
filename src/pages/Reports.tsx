
import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import ResumeFilter from "@/components/ResumeFilter";
import CandidateComparison from "@/components/CandidateComparison";
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
  Filter,
  Users
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
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
import { printReport, exportReportAsPDF, shareReport } from "@/utils/printUtils";
import { toast } from "sonner";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Sample data for charts
  const skillDistributionData = [
    { name: "Programming", value: 35 },
    { name: "Design", value: 25 },
    { name: "Communication", value: 20 },
    { name: "Problem Solving", value: 15 },
    { name: "Teamwork", value: 5 },
  ];
  
  const scoreDistributionData = [
    { name: "90-100%", value: 2 },
    { name: "80-89%", value: 8 },
    { name: "70-79%", value: 15 },
    { name: "60-69%", value: 12 },
    { name: "Below 60%", value: 5 },
  ];
  
  const experienceDistributionData = [
    { name: "0-1 Years", value: 8 },
    { name: "2-3 Years", value: 15 },
    { name: "4-5 Years", value: 12 },
    { name: "6-10 Years", value: 7 },
    { name: "10+ Years", value: 2 },
  ];
  
  const timelineData = [
    { month: "Jan", candidates: 12, hired: 2 },
    { month: "Feb", candidates: 18, hired: 3 },
    { month: "Mar", candidates: 25, hired: 4 },
    { month: "Apr", candidates: 20, hired: 3 },
    { month: "May", candidates: 28, hired: 5 },
    { month: "Jun", candidates: 32, hired: 6 },
  ];
  
  const scoreComparisonData = [
    { name: "Skills", current: 78, average: 70 },
    { name: "Experience", current: 84, average: 75 },
    { name: "Education", current: 65, average: 68 },
    { name: "Cultural Fit", current: 90, average: 72 },
    { name: "Technical Test", current: 80, average: 68 },
  ];
  
  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
  
  // Filter state management
  const [filters, setFilters] = useState({
    showTopCandidatesOnly: false
  });
  
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    toast.success("Filters applied successfully");
  };
  
  // Function handlers for buttons
  const handlePrint = () => {
    const reportNames = {
      overview: "Overview Report",
      candidates: "Candidate Analysis Report",
      skills: "Skills Analysis Report",
      timeline: "Hiring Timeline Report",
      comparison: "Candidate Comparison Report"
    };
    
    printReport(reportNames[activeTab as keyof typeof reportNames]);
  };
  
  const handleExport = () => {
    const reportNames = {
      overview: "Overview Report",
      candidates: "Candidate Analysis Report",
      skills: "Skills Analysis Report",
      timeline: "Hiring Timeline Report",
      comparison: "Candidate Comparison Report"
    };
    
    exportReportAsPDF(reportNames[activeTab as keyof typeof reportNames]);
  };
  
  const handleShare = () => {
    const reportNames = {
      overview: "Overview Report",
      candidates: "Candidate Analysis Report",
      skills: "Skills Analysis Report",
      timeline: "Hiring Timeline Report",
      comparison: "Candidate Comparison Report"
    };
    
    shareReport(reportNames[activeTab as keyof typeof reportNames]);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-7xl mx-auto fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Summarized Reports</h1>
              <p className="text-muted-foreground">
                Comprehensive overview of candidate evaluations and hiring metrics
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
          
          <Tabs 
            defaultValue="overview" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid grid-cols-5 md:w-auto w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="candidates">Candidates</TabsTrigger>
              <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <ResumeFilter onFilterChange={handleFilterChange} />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-subtle">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Skill Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartPieChart>
                        <Pie
                          data={skillDistributionData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {skillDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card className="shadow-subtle">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Score Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartBarChart data={scoreDistributionData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3B82F6" />
                      </RechartBarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card className="shadow-subtle">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Experience Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartPieChart>
                        <Pie
                          data={experienceDistributionData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {experienceDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-subtle">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Hiring Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartLineChart data={timelineData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="candidates" stroke="#3B82F6" strokeWidth={2} />
                        <Line type="monotone" dataKey="hired" stroke="#10B981" strokeWidth={2} />
                      </RechartLineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card className="shadow-subtle">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Score Comparison</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartBarChart data={scoreComparisonData} layout="vertical">
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="current" name="Current Role" fill="#3B82F6" />
                        <Bar dataKey="average" name="Company Average" fill="#10B981" />
                      </RechartBarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="shadow-subtle">
                <CardHeader>
                  <CardTitle>Executive Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>
                      Based on the evaluation of 42 candidates for the Senior Frontend Developer position, we've identified 
                      3 exceptional candidates with match scores above 85%. The majority of candidates (58%) possess 2-5 years 
                      of relevant experience, with programming skills being the most common strength area.
                    </p>
                    
                    <p>
                      Our hiring timeline shows an increase in qualified applicants over the past 3 months, with a corresponding 
                      improvement in the quality of hires as indicated by our scoring system. The current pool of candidates shows 
                      stronger technical skills but slightly lower educational qualifications compared to company averages.
                    </p>
                    
                    <p>
                      Recommended next steps include scheduling technical interviews with the top 5 candidates and initiating 
                      the team fit assessment process. For future hiring rounds, we recommend placing more emphasis on problem-solving 
                      abilities as this was an area where most candidates scored below our desired threshold.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="candidates">
              <ResumeFilter onFilterChange={handleFilterChange} />
              
              <Card className="shadow-subtle">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Candidate Detail Analysis</CardTitle>
                  <Button variant="outline" size="sm">
                    <FileSpreadsheet className="h-4 w-4 mr-1" />
                    Export Data
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Candidate</th>
                          <th className="text-left py-3 px-4">Experience</th>
                          <th className="text-left py-3 px-4">Skills</th>
                          <th className="text-left py-3 px-4">Education</th>
                          <th className="text-left py-3 px-4">Match Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">Alex Johnson</td>
                          <td className="py-3 px-4">8 years</td>
                          <td className="py-3 px-4">React, TypeScript, Node.js</td>
                          <td className="py-3 px-4">Master's in CS</td>
                          <td className="py-3 px-4"><span className="font-semibold text-green-600">92%</span></td>
                        </tr>
                        <tr className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">Morgan Smith</td>
                          <td className="py-3 px-4">5 years</td>
                          <td className="py-3 px-4">JavaScript, React, UX Design</td>
                          <td className="py-3 px-4">Bachelor's in CS</td>
                          <td className="py-3 px-4"><span className="font-semibold text-green-600">87%</span></td>
                        </tr>
                        <tr className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">Taylor Williams</td>
                          <td className="py-3 px-4">4 years</td>
                          <td className="py-3 px-4">React Native, Redux, GraphQL</td>
                          <td className="py-3 px-4">Bachelor's in SE</td>
                          <td className="py-3 px-4"><span className="font-semibold text-green-600">82%</span></td>
                        </tr>
                        <tr className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">Jordan Brown</td>
                          <td className="py-3 px-4">3 years</td>
                          <td className="py-3 px-4">Vue.js, CSS, JavaScript</td>
                          <td className="py-3 px-4">Associate's in CS</td>
                          <td className="py-3 px-4"><span className="font-semibold text-yellow-600">78%</span></td>
                        </tr>
                        <tr className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">Casey Davis</td>
                          <td className="py-3 px-4">6 years</td>
                          <td className="py-3 px-4">Angular, Java, Python</td>
                          <td className="py-3 px-4">Bachelor's in IT</td>
                          <td className="py-3 px-4"><span className="font-semibold text-yellow-600">75%</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="skills">
              <ResumeFilter onFilterChange={handleFilterChange} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-subtle">
                  <CardHeader>
                    <CardTitle>Skills Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartPieChart>
                          <Pie
                            data={skillDistributionData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
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
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="text-lg font-medium mb-2">Skills Gap Analysis</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Top skills present in the candidate pool compared with job requirements.
                      </p>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Programming</span>
                            <span className="text-sm font-medium">90%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-primary rounded-full h-2" style={{ width: "90%" }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Design</span>
                            <span className="text-sm font-medium">75%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-primary rounded-full h-2" style={{ width: "75%" }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Communication</span>
                            <span className="text-sm font-medium">60%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-primary rounded-full h-2" style={{ width: "60%" }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Problem Solving</span>
                            <span className="text-sm font-medium">45%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-primary rounded-full h-2" style={{ width: "45%" }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-subtle">
                  <CardHeader>
                    <CardTitle>Market Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartBarChart data={[
                          { skill: "JavaScript", current: 85, market: 90 },
                          { skill: "React", current: 70, market: 75 },
                          { skill: "TypeScript", current: 60, market: 70 },
                          { skill: "Node.js", current: 45, market: 60 },
                          { skill: "GraphQL", current: 25, market: 40 },
                        ]}>
                          <XAxis dataKey="skill" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="current" name="Current Candidates" fill="#3B82F6" />
                          <Bar dataKey="market" name="Market Demand" fill="#F59E0B" />
                        </RechartBarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="text-lg font-medium mb-2">Skill Recommendations</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Based on candidate pool analysis and market trends.
                      </p>
                      
                      <ul className="space-y-2 list-disc pl-5">
                        <li>Emphasize TypeScript experience in future job postings</li>
                        <li>Consider candidates with GraphQL experience as a plus</li>
                        <li>Look for candidates with both frontend and backend skills</li>
                        <li>Problem-solving skills are underrepresented in current candidate pool</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="timeline">
              <Card className="shadow-subtle mb-6">
                <CardHeader>
                  <CardTitle>Hiring Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartLineChart data={timelineData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="candidates" 
                          name="Total Candidates" 
                          stroke="#3B82F6" 
                          strokeWidth={2} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="hired" 
                          name="Candidates Hired" 
                          stroke="#10B981" 
                          strokeWidth={2} 
                        />
                      </RechartLineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-muted/30 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">42</div>
                      <div className="text-sm text-muted-foreground">Total Candidates</div>
                    </div>
                    
                    <div className="bg-muted/30 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-500">23</div>
                      <div className="text-sm text-muted-foreground">Interviews Conducted</div>
                    </div>
                    
                    <div className="bg-muted/30 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-amber-500">8</div>
                      <div className="text-sm text-muted-foreground">Offers Extended</div>
                    </div>
                    
                    <div className="bg-muted/30 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-500">6</div>
                      <div className="text-sm text-muted-foreground">Candidates Hired</div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Hiring Process Efficiency</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Analysis of time spent at each stage of the hiring process.
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Resume Screening</span>
                          <span className="text-sm font-medium">2 days avg.</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-green-500 rounded-full h-2" style={{ width: "20%" }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Initial Interview</span>
                          <span className="text-sm font-medium">4 days avg.</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-blue-500 rounded-full h-2" style={{ width: "40%" }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Technical Assessment</span>
                          <span className="text-sm font-medium">5 days avg.</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-amber-500 rounded-full h-2" style={{ width: "50%" }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Final Decision</span>
                          <span className="text-sm font-medium">3 days avg.</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-purple-500 rounded-full h-2" style={{ width: "30%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="comparison">
              <CandidateComparison />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Reports;
