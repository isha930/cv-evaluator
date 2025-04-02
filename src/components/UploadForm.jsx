
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Upload, FileText, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createJob, uploadResume } from "@/lib/api";

const UploadForm = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [skillsWeight, setSkillsWeight] = useState(50);
  const [experienceWeight, setExperienceWeight] = useState(50);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      handleFiles(newFiles);
    }
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      handleFiles(newFiles);
    }
  };
  
  const handleFiles = (newFiles) => {
    // Check if files are PDFs
    const validFiles = newFiles.filter(file => file.type === 'application/pdf');
    const invalidFiles = newFiles.filter(file => file.type !== 'application/pdf');
    
    if (invalidFiles.length > 0) {
      toast.error(`${invalidFiles.length} file(s) were not added. Only PDF files are accepted.`);
    }
    
    if (validFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
      toast.success(`${validFiles.length} file(s) added successfully`);
    }
  };
  
  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!jobTitle.trim()) {
      toast.error('Please enter a job title');
      return;
    }
    
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }
    
    if (files.length === 0) {
      toast.error('Please upload at least one resume');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // First, create the job
      const jobData = {
        title: jobTitle,
        description: jobDescription,
        skillsWeight,
        experienceWeight
      };
      
      let jobId = currentJobId;
      
      if (!jobId) {
        const jobResult = await createJob(jobData);
        jobId = jobResult.job._id;
        setCurrentJobId(jobId);
      }
      
      // Then upload each resume
      let successCount = 0;
      let errorCount = 0;
      
      for (const file of files) {
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobId', jobId);
        
        try {
          await uploadResume(formData);
          successCount++;
        } catch (err) {
          console.error('Error uploading resume:', err);
          errorCount++;
        }
      }
      
      if (successCount > 0) {
        toast.success(`${successCount} resume(s) uploaded and analyzed successfully`);
        
        // Reset form or navigate to results
        setFiles([]);
        navigate(`/ranking?jobId=${jobId}`);
      }
      
      if (errorCount > 0) {
        toast.error(`${errorCount} resume(s) failed to upload`);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`An error occurred: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Update experienceWeight when skillsWeight changes to maintain 100% total
  useEffect(() => {
    setExperienceWeight(100 - skillsWeight);
  }, [skillsWeight]);
  
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
              required
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Upload Resumes</CardTitle>
          <CardDescription>Drag and drop multiple resume files or click to browse</CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className={cn(
              "border-2 border-dashed rounded-lg p-10 transition-all duration-200 text-center",
              dragActive ? "border-primary bg-primary/5" : "border-border",
              files.length > 0 ? "bg-muted/50" : ""
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
              multiple
            />
            
            <div className="flex flex-col items-center space-y-4">
              {files.length === 0 ? (
                <>
                  <div className="rounded-full p-4 bg-primary/10 text-primary">
                    <Upload className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Drag files here or click to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">Supports multiple PDF files</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('fileUpload').click()}
                    type="button"
                  >
                    <FileText className="mr-2 h-4 w-4" /> Choose files
                  </Button>
                </>
              ) : (
                <>
                  <div className="rounded-full p-4 bg-green-500/10 text-green-500">
                    <FileText className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{files.length} file(s) selected</p>
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('fileUpload').click()}
                      type="button"
                      className="mt-2"
                    >
                      Add more files
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium">Selected Files:</p>
              <div className="max-h-60 overflow-y-auto rounded-md border">
                {files.map((file, index) => (
                  <div 
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between p-3 border-b last:border-b-0"
                  >
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-primary" />
                      <div>
                        <p className="text-sm font-medium truncate max-w-xs">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeFile(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Ranking Criteria</CardTitle>
          <CardDescription>Adjust the weights for evaluation categories</CardDescription>
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
                setSkillsWeight(value[0]);
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
              disabled
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
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isUploading}>
            {isUploading ? (
              <>Uploading...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Upload & Evaluate
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default UploadForm;
