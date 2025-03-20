
import React from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart, Printer, Download, Share2 } from "lucide-react";
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

const Reports = () => {
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
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
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
          
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="candidates">Candidates</TabsTrigger>
              <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
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
              <Card className="shadow-subtle">
                <CardHeader>
                  <CardTitle>Candidate Detail Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    This section would contain detailed candidate-by-candidate analysis with individual strengths, 
                    weaknesses, and potential fit assessments.
                  </p>
                  
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
                      <BarChart className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Candidate Reports</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      This feature will be expanded in the next version to provide detailed
                      candidate-specific reports and comparisons.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="skills">
              <Card className="shadow-subtle">
                <CardHeader>
                  <CardTitle>Skills Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    This section would contain detailed analysis of required skills vs. available 
                    skills in the candidate pool.
                  </p>
                  
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
                      <PieChart className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Skills Gap Analysis</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      This feature will be expanded in the next version to provide
                      detailed skills gap analysis and market comparisons.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="timeline">
              <Card className="shadow-subtle">
                <CardHeader>
                  <CardTitle>Hiring Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    This section would contain detailed timeline analysis of the hiring process.
                  </p>
                  
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
                      <LineChart className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Timeline Analysis</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      This feature will be expanded in the next version to provide
                      detailed hiring timeline visualizations and efficiency metrics.
                    </p>
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
