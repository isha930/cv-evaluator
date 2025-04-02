
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";

interface RankingHeaderProps {
  jobTitle: string;
  onExport: () => void;
}

const RankingHeader: React.FC<RankingHeaderProps> = ({ jobTitle, onExport }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Resume Rankings</h1>
        <p className="text-muted-foreground">
          Current rankings based on your criteria for <span className="font-medium">{jobTitle || "This Job"}</span>
        </p>
      </div>
      
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>
      </div>
    </div>
  );
};

export default RankingHeader;
