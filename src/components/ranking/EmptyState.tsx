
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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
          : "Please select a job from the Reports page to view its resume rankings."}
      </p>
      {hasJobId ? (
        <Button onClick={() => window.location.href = '/upload'}>
          Upload Resumes
        </Button>
      ) : (
        <Button asChild>
          <Link to="/reports">Go to Reports</Link>
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
