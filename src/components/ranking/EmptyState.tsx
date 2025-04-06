
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileUp, FilePlus, Briefcase } from "lucide-react";

interface EmptyStateProps {
  hasJobId: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ hasJobId }) => {
  return (
    <div className="text-center py-16 px-6 bg-card rounded-lg shadow-subtle border flex flex-col items-center">
      <div className="bg-muted rounded-full p-6 mb-6">
        {hasJobId ? (
          <FileUp className="h-12 w-12 text-muted-foreground" />
        ) : (
          <Briefcase className="h-12 w-12 text-muted-foreground" />
        )}
      </div>
      
      <h3 className="text-2xl font-medium mb-3">No Resumes Found</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {hasJobId 
          ? "There are no resumes uploaded for this job position yet. Add some resumes to get started with the ranking."
          : "Please select a job position from the Reports page first. You need to create a job before you can upload resumes."}
      </p>
      
      {hasJobId ? (
        <Button size="lg" onClick={() => window.location.href = '/upload'}>
          <FilePlus className="mr-2 h-5 w-5" />
          Upload Resumes
        </Button>
      ) : (
        <Button size="lg" asChild>
          <Link to="/reports">Go to Reports</Link>
        </Button>
      )}
      
      {!hasJobId && (
        <div className="mt-4 text-sm text-muted-foreground">
          <p>If you haven't created any jobs yet, you'll need to create one first.</p>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
