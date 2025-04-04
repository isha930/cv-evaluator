
import React from "react";
import { ResumeData } from "@/components/ResumeCard";
import { ArrowUp, ArrowDown, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RankingTableProps {
  resumes: ResumeData[];
  onRankUp: (id: string) => void;
  onRankDown: (id: string) => void;
  onView: (id: string) => void;
}

const RankingTable: React.FC<RankingTableProps> = ({
  resumes,
  onRankUp,
  onRankDown,
  onView,
}) => {
  // Calculate score color based on the score value
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-amber-600";
    return "text-red-600";
  };

  if (resumes.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No resumes found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Rank</th>
            <th className="text-left py-3 px-4">Candidate Name</th>
            <th className="text-left py-3 px-4">Position</th>
            <th className="text-left py-3 px-4">Skills</th>
            <th className="text-left py-3 px-4">Experience</th>
            <th className="text-left py-3 px-4">Overall</th>
            <th className="text-right py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {resumes.map((resume) => (
            <tr key={resume.id} className="border-b hover:bg-muted/50">
              <td className="py-3 px-4 text-muted-foreground">#{resume.rank}</td>
              <td className="py-3 px-4 font-medium">{resume.name}</td>
              <td className="py-3 px-4 text-muted-foreground">{resume.position}</td>
              <td className="py-3 px-4">
                <span className={cn("font-medium", getScoreColor(resume.skillScore))}>
                  {resume.skillScore}%
                </span>
              </td>
              <td className="py-3 px-4">
                <span className={cn("font-medium", getScoreColor(resume.experienceScore))}>
                  {resume.experienceScore}%
                </span>
              </td>
              <td className="py-3 px-4">
                <span className={cn("font-medium", getScoreColor(resume.overallScore))}>
                  {resume.overallScore}%
                </span>
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRankUp(resume.id)}
                    disabled={resume.rank <= 1}
                    className="h-8 w-8"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRankDown(resume.id)}
                    disabled={resume.rank >= resumes.length}
                    className="h-8 w-8"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onView(resume.id)}
                    className="h-8 w-8"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RankingTable;
