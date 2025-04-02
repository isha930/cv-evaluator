
import React from "react";

interface RankingOverviewProps {
  totalCandidates: number;
  averageScore: number;
  topPerformer: string;
}

const RankingOverview: React.FC<RankingOverviewProps> = ({ 
  totalCandidates, 
  averageScore, 
  topPerformer 
}) => {
  return (
    <div className="bg-card rounded-lg p-4 shadow-subtle border">
      <h3 className="font-medium mb-2">Ranking Overview</h3>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Candidates</span>
          <span className="font-medium">{totalCandidates}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Average Score</span>
          <span className="font-medium">{averageScore}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Top Performer</span>
          <span className="font-medium">{topPerformer}</span>
        </div>
      </div>
    </div>
  );
};

export default RankingOverview;
