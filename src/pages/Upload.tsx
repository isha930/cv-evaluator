
import React from "react";
import Navigation from "@/components/Navigation";
import UploadForm from "@/components/UploadForm";

const Upload = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-3xl mx-auto text-center mb-12 fade-in">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Upload Resumes</h1>
          <p className="text-muted-foreground">
            Upload candidate resumes and set your evaluation criteria to get started
          </p>
        </div>
        
        <UploadForm />
      </main>
    </div>
  );
};

export default Upload;
