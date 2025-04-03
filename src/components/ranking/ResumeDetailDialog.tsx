
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Resume } from "@/hooks/useResumeRanking";
import { Progress } from "@/components/ui/progress";
import { User, Briefcase, FileText, Download, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

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
  onRankDown,
}) => {
  if (!resume) return null;
  
  const scoreToColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  const handleDownload = () => {
    if (resume?.file_url) {
      window.open(resume.file_url, '_blank');
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{resume.name}</span>
            <div className="px-2 py-1 bg-primary-foreground rounded-md text-sm font-medium">
              Rank #{resume.rank}
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Briefcase className="h-4 w-4 mr-2" />
            <span>{resume.position}</span>
          </div>
          
          <div className="text-sm">
            <h3 className="font-medium mb-2">Summary</h3>
            <p className="text-muted-foreground bg-muted p-3 rounded-md">
              {resume.summary}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
              <h3 className="font-medium">Skills Assessment</h3>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center"><User className="h-3 w-3 mr-1" />Skills</span>
                  <span>{resume.skill_score}%</span>
                </div>
                <Progress value={resume.skill_score} className={cn("h-2", scoreToColor(resume.skill_score))} />
              </div>
              <p className="text-xs text-muted-foreground">{resume.skill_description}</p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Experience Assessment</h3>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center"><Briefcase className="h-3 w-3 mr-1" />Experience</span>
                  <span>{resume.experience_score}%</span>
                </div>
                <Progress value={resume.experience_score} className={cn("h-2", scoreToColor(resume.experience_score))} />
              </div>
              <p className="text-xs text-muted-foreground">{resume.experience_description}</p>
            </div>
          </div>
          
          <div className="pt-4">
            <h3 className="font-medium mb-2">Overall Score</h3>
            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span>Total Score</span>
                <span>{resume.overall_score}%</span>
              </div>
              <Progress value={resume.overall_score} className={cn("h-3", scoreToColor(resume.overall_score))} />
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="w-full sm:w-auto" onClick={handleDownload}>
            <FileText className="mr-2 h-4 w-4" />
            View Resume
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="secondary" 
              className="flex-1" 
              onClick={() => onRankUp(resume.id)}
              disabled={resume.rank <= 1}
            >
              <ArrowUp className="mr-2 h-4 w-4" />
              Rank Up
            </Button>
            <Button 
              variant="secondary" 
              className="flex-1" 
              onClick={() => onRankDown(resume.id)}
            >
              <ArrowDown className="mr-2 h-4 w-4" />
              Rank Down
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeDetailDialog;
