
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileUp, FilePlus } from "lucide-react";

interface EmptyStateProps {
  hasJobId: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ hasJobId }) => {
  return (
    <div className="text-center py-16 px-6 bg-card rounded-lg shadow-subtle border flex flex-col items-center">
      <div className="bg-muted rounded-full p-6 mb-6">
        <FileUp className="h-12 w-12 text-muted-foreground" />
      </div>
      
      <h3 className="text-2xl font-medium mb-3">No Resumes Found</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {hasJobId 
          ? "There are no resumes uploaded for this job position yet. Add some resumes to get started with the ranking."
          : "Please select a job from the Reports page to view its resume rankings."}
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
    </div>
  );
};

export default EmptyState;
