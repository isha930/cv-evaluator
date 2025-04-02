
import React from "react";
import ResumeCard from "@/components/ResumeCard";
import { ResumeData } from "@/components/ResumeCard";

interface TopCandidatesProps {
  candidates: ResumeData[];
  onView: (id: string) => void;
}

const TopCandidates: React.FC<TopCandidatesProps> = ({ candidates, onView }) => {
  return (
    <div className="bg-card rounded-lg p-4 shadow-subtle border">
      <h3 className="font-medium mb-3">Top Candidates</h3>
      <div className="space-y-4">
        {candidates.map(resume => (
          <ResumeCard 
            key={resume.id}
            resume={resume}
            compact={true}
            onView={() => onView(resume.id)}
            onRankUp={() => {}}
            onRankDown={() => {}}
          />
        ))}
      </div>
    </div>
  );
};

export default TopCandidates;
