
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Upload, FileText, Save } from "lucide-react";
import { cn } from "@/lib/utils";

const UploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [skillsWeight, setSkillsWeight] = useState(33);
  const [experienceWeight, setExperienceWeight] = useState(33);
  const [educationWeight, setEducationWeight] = useState(34);
  const [dragActive, setDragActive] = useState(false);
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  
  const handleFile = (file: File) => {
    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      toast.error('Please upload PDF files only');
      return;
    }
    
    setFile(file);
    toast.success('File added successfully');
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!file) {
      toast.error('Please upload a resume');
      return;
    }
    
    if (!jobTitle.trim()) {
      toast.error('Please enter a job title');
      return;
    }
    
    // Here you would handle the actual form submission
    console.log({
      file,
      jobTitle,
      jobDescription,
      weights: {
        skills: skillsWeight,
        experience: experienceWeight,
        education: educationWeight,
      }
    });
    
    toast.success('Resume uploaded for evaluation');
    
    // Reset form
    setFile(null);
    setJobTitle('');
    setJobDescription('');
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-2xl mx-auto fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Job Description</CardTitle>
          <CardDescription>Enter the job details to match candidates against</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input 
              id="jobTitle" 
              placeholder="e.g. Frontend Developer" 
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description</Label>
            <Textarea 
              id="jobDescription" 
              placeholder="Enter the full job description..." 
              className="min-h-[120px]"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Upload Resumes</CardTitle>
          <CardDescription>Drag and drop your resume files or click to browse</CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className={cn(
              "border-2 border-dashed rounded-lg p-10 transition-all duration-200 text-center",
              dragActive ? "border-primary bg-primary/5" : "border-border",
              file ? "bg-muted/50" : ""
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              id="fileUpload"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            
            <div className="flex flex-col items-center space-y-4">
              {!file ? (
                <>
                  <div className="rounded-full p-4 bg-primary/10 text-primary">
                    <Upload className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Drag file here or click to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">Supports PDF format only</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('fileUpload')?.click()}
                    type="button"
                  >
                    <FileText className="mr-2 h-4 w-4" /> Choose file
                  </Button>
                </>
              ) : (
                <>
                  <div className="rounded-full p-4 bg-green-500/10 text-green-500">
                    <FileText className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('fileUpload')?.click()}
                    type="button"
                  >
                    Change file
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Ranking Criteria</CardTitle>
          <CardDescription>Adjust the weights for each evaluation category</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="skillsWeight">Skills</Label>
              <span className="text-sm font-medium">{skillsWeight}%</span>
            </div>
            <Slider 
              id="skillsWeight" 
              value={[skillsWeight]} 
              min={0} 
              max={100} 
              step={1}
              onValueChange={(value) => {
                const newValue = value[0];
                setSkillsWeight(newValue);
                // Adjust other sliders to maintain 100% total
                const remaining = 100 - newValue;
                const ratio = remaining / (experienceWeight + educationWeight);
                setExperienceWeight(Math.round(experienceWeight * ratio));
                setEducationWeight(100 - newValue - Math.round(experienceWeight * ratio));
              }}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="experienceWeight">Experience</Label>
              <span className="text-sm font-medium">{experienceWeight}%</span>
            </div>
            <Slider 
              id="experienceWeight" 
              value={[experienceWeight]} 
              min={0} 
              max={100} 
              step={1}
              onValueChange={(value) => {
                const newValue = value[0];
                setExperienceWeight(newValue);
                // Adjust other sliders to maintain 100% total
                const remaining = 100 - newValue;
                const ratio = remaining / (skillsWeight + educationWeight);
                setSkillsWeight(Math.round(skillsWeight * ratio));
                setEducationWeight(100 - newValue - Math.round(skillsWeight * ratio));
              }}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="educationWeight">Education</Label>
              <span className="text-sm font-medium">{educationWeight}%</span>
            </div>
            <Slider 
              id="educationWeight" 
              value={[educationWeight]} 
              min={0} 
              max={100} 
              step={1}
              onValueChange={(value) => {
                const newValue = value[0];
                setEducationWeight(newValue);
                // Adjust other sliders to maintain 100% total
                const remaining = 100 - newValue;
                const ratio = remaining / (skillsWeight + experienceWeight);
                setSkillsWeight(Math.round(skillsWeight * ratio));
                setExperienceWeight(100 - newValue - Math.round(skillsWeight * ratio));
              }}
            />
          </div>
          
          <div className="flex justify-center pt-2">
            <div className="w-48 h-48 rounded-full border-8 border-muted relative">
              <div 
                className="absolute inset-0 bg-blue-500 rounded-full"
                style={{ 
                  clipPath: `conic-gradient(from 0deg, transparent ${100 - skillsWeight}%, currentColor 0)`,
                  color: 'hsl(221, 83%, 53%)'
                }}
              />
              <div 
                className="absolute inset-0 bg-green-500 rounded-full"
                style={{ 
                  clipPath: `conic-gradient(from ${skillsWeight * 3.6}deg, transparent ${100 - experienceWeight}%, currentColor 0)`,
                  color: 'hsl(142, 71%, 45%)'
                }}
              />
              <div 
                className="absolute inset-0 bg-amber-500 rounded-full"
                style={{ 
                  clipPath: `conic-gradient(from ${(skillsWeight + experienceWeight) * 3.6}deg, transparent ${100 - educationWeight}%, currentColor 0)`,
                  color: 'hsl(45, 93%, 47%)'
                }}
              />
              <div className="absolute inset-4 bg-background rounded-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div className="text-2xl font-semibold">100%</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-6 pt-2 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
              <span>Skills</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
              <span>Experience</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-amber-500 mr-1"></div>
              <span>Education</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Upload & Evaluate
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default UploadForm;
