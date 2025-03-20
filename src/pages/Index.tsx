
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { ArrowRight, Upload, BarChart2, FileText } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const isMobile = useIsMobile();
  
  const features = [
    {
      title: "Resume Upload",
      description: "Upload resumes in PDF format and extract relevant information automatically.",
      icon: <Upload className="h-10 w-10 text-primary" />,
      link: "/upload"
    },
    {
      title: "Smart Ranking",
      description: "Rank candidates based on skills, experience, and education with customizable weights.",
      icon: <BarChart2 className="h-10 w-10 text-primary" />,
      link: "/ranking"
    },
    {
      title: "Detailed Reports",
      description: "Generate comprehensive reports to make informed hiring decisions quickly.",
      icon: <FileText className="h-10 w-10 text-primary" />,
      link: "/reports"
    }
  ];
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container px-4 md:px-6 py-8 md:py-12 lg:py-16">
        <section className="py-12 md:py-16 lg:py-20 relative">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-500/5 rounded-3xl blur-3xl opacity-30"
            style={{ 
              transform: "translate(-5%, -5%) rotate(-5deg)",
              zIndex: -1 
            }}
          ></div>
          
          <div className="max-w-3xl mx-auto text-center space-y-8 fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Smart Resume Ranking for Efficient Hiring
            </h1>
            
            <p className="text-xl text-muted-foreground">
              Automate your candidate selection process with our intelligent resume ranking system, 
              helping you find the perfect match faster.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="font-medium">
                <Link to="/upload">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="font-medium">
                <Link to="/ranking">
                  View Demo Ranking
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        <section className="py-16 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Features Overview</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Everything you need to streamline your hiring process, from resume uploads to final selection.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 staggered">
            {features.map((feature, index) => (
              <Card key={index} className="transition-all duration-300 hover:shadow-elevation hover-scale overflow-hidden h-full">
                <CardHeader className="pb-2">
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="ghost" className="w-full justify-start p-0 hover:bg-transparent">
                    <Link to={feature.link} className="flex items-center text-primary">
                      Learn more
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
        
        <section className="py-16 md:py-20 relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-gradient-to-b from-background via-muted to-background rounded-3xl -z-10"
          ></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 scale-in">
              <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
              <p className="text-muted-foreground">
                Our system uses advanced algorithms to analyze and rank resumes based on the specific requirements of your job posting.
              </p>
              
              <div className="space-y-4">
                {[
                  { 
                    number: "01", 
                    title: "Upload Resumes", 
                    desc: "Upload candidate resumes and define your job requirements." 
                  },
                  { 
                    number: "02", 
                    title: "Set Criteria", 
                    desc: "Customize the importance of skills, experience, and education." 
                  },
                  { 
                    number: "03", 
                    title: "Review Rankings", 
                    desc: "Get instant rankings based on your criteria with detailed scoring." 
                  },
                  { 
                    number: "04", 
                    title: "Generate Reports", 
                    desc: "Create comprehensive reports for stakeholders and decision makers." 
                  },
                ].map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                      {step.number}
                    </div>
                    <div>
                      <h3 className="font-medium">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button asChild className="mt-6">
                <Link to="/upload">Start Ranking Now</Link>
              </Button>
            </div>
            
            <div className="relative fade-in lg:pl-8">
              <div className="bg-muted/50 rounded-lg p-4 border shadow-subtle backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Top Candidates</h3>
                  <Button variant="outline" size="sm">View All</Button>
                </div>
                
                <div className="space-y-3">
                  {[
                    { name: "Alex Johnson", position: "Senior Developer", score: 92 },
                    { name: "Maria Garcia", position: "UX Designer", score: 88 },
                    { name: "David Smith", position: "Product Manager", score: 85 },
                  ].map((candidate, i) => (
                    <div key={i} className="flex items-center p-3 bg-background rounded border">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium mr-3">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{candidate.name}</div>
                        <div className="text-sm text-muted-foreground">{candidate.position}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{candidate.score}%</div>
                        <div className="text-xs text-muted-foreground">Match</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div 
                className="absolute -top-6 -right-6 -bottom-6 -left-6 bg-gradient-to-tr from-primary/20 to-blue-300/20 -z-10 rounded-xl"
                style={{ 
                  transform: "rotate(-3deg)",
                  filter: "blur(40px)",
                  opacity: 0.6 
                }}
              ></div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <BarChart2 className="h-6 w-6 text-primary" />
              <span className="text-lg font-medium">ResumeRank</span>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} ResumeRank. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
