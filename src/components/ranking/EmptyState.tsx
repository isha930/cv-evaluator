
import React from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  hasJobId: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ hasJobId }) => {
  return (
    <div className="text-center py-12 bg-card rounded-lg shadow-subtle border">
      <h3 className="text-xl font-medium mb-2">No Resumes Found</h3>
      <p className="text-muted-foreground mb-4">
        {hasJobId 
          ? "There are no resumes uploaded for this job position yet."
          : "Please select a job to view its resume rankings."}
      </p>
      <Button onClick={() => window.location.href = '/upload'}>
        Upload Resumes
      </Button>
    </div>
  );
};

export default EmptyState;
