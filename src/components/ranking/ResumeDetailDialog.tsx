
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Resume {
  id: string;
  name: string;
  position: string;
  skill_score: number;
  skill_description: string;
  experience_score: number;
  experience_description: string;
  overall_score: number;
  summary: string;
  rank: number;
  file_url?: string;
}

interface ResumeDetailDialogProps {
  resume: Resume | null;
  isOpen: boolean;
  onClose: () => void;
  onRankUp: (id: string) => void;
  onRankDown: (id: string) => void;
}

const ResumeDetailDialog: React.FC<ResumeDetailDialogProps> = ({
  resume,
  isOpen,
  onClose,
  onRankUp,
  onRankDown
}) => {
  if (!resume) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{resume.name}</DialogTitle>
          <DialogDescription>{resume.position}</DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">Skills</h4>
            <div className="text-2xl font-semibold">{resume.skill_score}%</div>
            <p className="text-sm text-muted-foreground">
              {resume.skill_description}
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Experience</h4>
            <div className="text-2xl font-semibold">{resume.experience_score}%</div>
            <p className="text-sm text-muted-foreground">
              {resume.experience_description}
            </p>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Resume Summary</h4>
          <p className="text-muted-foreground text-sm">
            {resume.summary || 
              "This is a placeholder for the resume summary. In a real application, this would display the parsed content from the resume."}
          </p>
        </div>
        
        {resume.file_url && (
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => window.open(resume.file_url, '_blank')}
              className="w-full"
            >
              View Original Resume
            </Button>
          </div>
        )}
        
        <div className="mt-4 flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              onRankUp(resume.id);
              onClose();
            }}
            disabled={resume.rank <= 1}
          >
            Move Up
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onRankDown(resume.id);
              onClose();
            }}
          >
            Move Down
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeDetailDialog;
