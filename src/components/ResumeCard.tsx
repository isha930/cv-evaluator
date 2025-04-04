
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ResumeData {
  id: string;
  name: string;
  position: string;
  skillScore: number;
  experienceScore: number;
  overallScore: number;
  rank: number;
}

interface ResumeCardProps {
  resume: ResumeData;
  compact?: boolean;
  onView: (id: string) => void;
  onRankUp: (id: string) => void;
  onRankDown: (id: string) => void;
}

const ResumeCard: React.FC<ResumeCardProps> = ({
  resume,
  compact = false,
  onView,
  onRankUp,
  onRankDown,
}) => {
  const scoreSize = compact ? "text-base" : "text-2xl";
  const labelSize = compact ? "text-xs" : "text-sm";
  
  // Calculate score color based on the score value
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-amber-600";
    return "text-red-600";
  };
  
  return (
    <Card>
      <CardContent className={cn(
        "flex items-center p-4",
        compact ? "gap-3" : "gap-4"
      )}>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h4 className={cn("font-medium", compact ? "text-base" : "text-lg")}>
                {resume.name}
              </h4>
              <p className="text-muted-foreground text-sm">
                {resume.position}
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              Rank #{resume.rank}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div>
              <p className={cn("font-medium", scoreSize, getScoreColor(resume.skillScore))}>
                {resume.skillScore}%
              </p>
              <p className={cn("text-muted-foreground", labelSize)}>Skills</p>
            </div>
            <div>
              <p className={cn("font-medium", scoreSize, getScoreColor(resume.experienceScore))}>
                {resume.experienceScore}%
              </p>
              <p className={cn("text-muted-foreground", labelSize)}>Experience</p>
            </div>
            <div>
              <p className={cn("font-medium", scoreSize, getScoreColor(resume.overallScore))}>
                {resume.overallScore}%
              </p>
              <p className={cn("text-muted-foreground", labelSize)}>Overall</p>
            </div>
          </div>
        </div>
        
        <div className={cn("flex", compact ? "flex-col" : "flex-row", "gap-2")}>
          <Button
            variant="ghost"
            size={compact ? "sm" : "default"}
            onClick={() => onRankUp(resume.id)}
            title="Rank Up"
          >
            <ArrowUp className={cn("h-4 w-4", compact ? "" : "mr-1")} />
            {!compact && "Up"}
          </Button>
          <Button
            variant="ghost"
            size={compact ? "sm" : "default"}
            onClick={() => onRankDown(resume.id)}
            title="Rank Down"
          >
            <ArrowDown className={cn("h-4 w-4", compact ? "" : "mr-1")} />
            {!compact && "Down"}
          </Button>
          <Button
            variant="outline"
            size={compact ? "sm" : "default"}
            onClick={() => onView(resume.id)}
            title="View Details"
          >
            <Eye className={cn("h-4 w-4", compact ? "" : "mr-1")} />
            {!compact && "View"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumeCard;
