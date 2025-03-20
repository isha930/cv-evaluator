
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowUp, ArrowDown, Eye, User, Briefcase, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ResumeData {
  id: string;
  name: string;
  position: string;
  skillScore: number;
  experienceScore: number;
  educationScore: number;
  overallScore: number;
  rank: number;
}

interface ResumeCardProps {
  resume: ResumeData;
  onRankUp?: () => void;
  onRankDown?: () => void;
  onView?: () => void;
  compact?: boolean;
}

const ResumeCard: React.FC<ResumeCardProps> = ({
  resume,
  onRankUp,
  onRankDown,
  onView,
  compact = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const scoreToColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  return (
    <Card 
      className={cn(
        "hover-scale overflow-hidden transition-all duration-300",
        isHovered ? "shadow-elevation" : "shadow-subtle",
        compact ? "w-full" : "w-full max-w-sm"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-2 relative">
        <div className="absolute top-3 right-3">
          <Badge variant={resume.rank <= 3 ? "default" : "secondary"}>
            Rank #{resume.rank}
          </Badge>
        </div>
        <CardTitle className="line-clamp-1">{resume.name}</CardTitle>
        <div className="text-sm text-muted-foreground flex items-center">
          <Briefcase className="h-3 w-3 mr-1" />
          {resume.position}
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        {!compact && (
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="flex items-center"><User className="h-3 w-3 mr-1" />Skills</span>
                <span>{resume.skillScore}%</span>
              </div>
              <Progress value={resume.skillScore} className={cn("h-2", scoreToColor(resume.skillScore))} />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="flex items-center"><Briefcase className="h-3 w-3 mr-1" />Experience</span>
                <span>{resume.experienceScore}%</span>
              </div>
              <Progress value={resume.experienceScore} className={cn("h-2", scoreToColor(resume.experienceScore))} />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="flex items-center"><GraduationCap className="h-3 w-3 mr-1" />Education</span>
                <span>{resume.educationScore}%</span>
              </div>
              <Progress value={resume.educationScore} className={cn("h-2", scoreToColor(resume.educationScore))} />
            </div>
            
            <div className="space-y-1 pt-2">
              <div className="flex justify-between font-medium">
                <span>Overall Score</span>
                <span>{resume.overallScore}%</span>
              </div>
              <Progress value={resume.overallScore} className={cn("h-3", scoreToColor(resume.overallScore))} />
            </div>
          </div>
        )}
        
        {compact && (
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm font-medium">
                <span>Overall</span>
                <span>{resume.overallScore}%</span>
              </div>
              <Progress value={resume.overallScore} className={cn("h-2 mt-1", scoreToColor(resume.overallScore))} />
            </div>
            <div className="flex space-x-1">
              <Button variant="outline" size="icon" onClick={onView}>
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      
      {!compact && (
        <CardFooter className="bg-muted/40 pt-2 pb-2">
          <div className="flex justify-between w-full">
            <Button variant="outline" size="sm" onClick={onRankUp} disabled={resume.rank <= 1}>
              <ArrowUp className="h-4 w-4 mr-1" />
              Rank Up
            </Button>
            <Button variant="outline" size="sm" onClick={onView}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button variant="outline" size="sm" onClick={onRankDown}>
              <ArrowDown className="h-4 w-4 mr-1" />
              Rank Down
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default ResumeCard;
