
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowUp, ArrowDown, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const RankingTable = ({
  resumes,
  onRankUp,
  onRankDown,
  onView,
}) => {
  const [sortConfig, setSortConfig] = useState({ 
    key: 'rank', 
    direction: 'ascending' 
  });
  
  const scoreToColor = (score) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedResumes = [...resumes].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });
  
  return (
    <div className="w-full overflow-auto fade-in">
      <Table className="min-w-[800px]">
        <TableHeader>
          <TableRow>
            <TableHead 
              className="w-[100px] cursor-pointer"
              onClick={() => requestSort('rank')}
            >
              Rank {sortConfig.key === 'rank' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => requestSort('name')}
            >
              Candidate {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => requestSort('position')}
            >
              Position {sortConfig.key === 'position' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </TableHead>
            <TableHead 
              className="cursor-pointer w-[180px]"
              onClick={() => requestSort('skillScore')}
            >
              Skills {sortConfig.key === 'skillScore' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </TableHead>
            <TableHead 
              className="cursor-pointer w-[180px]"
              onClick={() => requestSort('experienceScore')}
            >
              Experience {sortConfig.key === 'experienceScore' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </TableHead>
            <TableHead 
              className="cursor-pointer w-[180px]"
              onClick={() => requestSort('overallScore')}
            >
              Overall {sortConfig.key === 'overallScore' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </TableHead>
            <TableHead className="text-right w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedResumes.map((resume) => (
            <TableRow key={resume._id} className="hover:bg-muted/50 transition-colors">
              <TableCell className="font-medium">{resume.rank}</TableCell>
              <TableCell>{resume.name}</TableCell>
              <TableCell>{resume.position}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Progress value={resume.skillScore} className={cn("h-2 flex-1 mr-2", scoreToColor(resume.skillScore))} />
                  <span className="text-sm">{resume.skillScore}%</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Progress value={resume.experienceScore} className={cn("h-2 flex-1 mr-2", scoreToColor(resume.experienceScore))} />
                  <span className="text-sm">{resume.experienceScore}%</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Progress value={resume.overallScore} className={cn("h-2 flex-1 mr-2", scoreToColor(resume.overallScore))} />
                  <span className="text-sm">{resume.overallScore}%</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-1">
                  <Button variant="outline" size="icon" onClick={() => onRankUp(resume._id)} disabled={resume.rank <= 1}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => onView(resume._id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => onRankDown(resume._id)}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RankingTable;
