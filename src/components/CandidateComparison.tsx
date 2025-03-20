
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Users,
  ChevronRight,
  BarChart,
  Briefcase,
  GraduationCap,
  Award,
} from "lucide-react";
import {
  Bar,
  BarChart as RechartBarChart,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Mock candidate data - in a real app this would come from API or props
const candidateData = [
  { id: 1, name: "Alex Johnson", match: 92 },
  { id: 2, name: "Morgan Smith", match: 87 },
  { id: 3, name: "Taylor Williams", match: 82 },
  { id: 4, name: "Jordan Brown", match: 78 },
  { id: 5, name: "Casey Davis", match: 75 },
];

// Mock comparison data
const generateComparisonData = (candidate1: string, candidate2: string) => [
  { category: "Technical Skills", candidate1: 85, candidate2: 78 },
  { category: "Experience", candidate1: 92, candidate2: 65 },
  { category: "Education", candidate1: 75, candidate2: 88 },
  { category: "Communication", candidate1: 80, candidate2: 90 },
  { category: "Problem Solving", candidate1: 88, candidate2: 72 },
];

const CandidateComparison = () => {
  const [candidate1, setCandidate1] = useState<string>("1");
  const [candidate2, setCandidate2] = useState<string>("2");
  const [comparisonData, setComparisonData] = useState(
    generateComparisonData(candidate1, candidate2)
  );

  const handleCompare = () => {
    // In a real app, this would fetch data from an API
    setComparisonData(generateComparisonData(candidate1, candidate2));
  };

  const getCandidateName = (id: string) => {
    const candidate = candidateData.find(c => c.id.toString() === id);
    return candidate ? candidate.name : "Unknown";
  };

  return (
    <Card className="shadow-subtle">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Candidate Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium">First Candidate</label>
            <Select value={candidate1} onValueChange={setCandidate1}>
              <SelectTrigger>
                <SelectValue placeholder="Select candidate" />
              </SelectTrigger>
              <SelectContent>
                {candidateData.map(candidate => (
                  <SelectItem key={candidate.id} value={candidate.id.toString()}>
                    {candidate.name} ({candidate.match}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-center">
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
          
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium">Second Candidate</label>
            <Select value={candidate2} onValueChange={setCandidate2}>
              <SelectTrigger>
                <SelectValue placeholder="Select candidate" />
              </SelectTrigger>
              <SelectContent>
                {candidateData.map(candidate => (
                  <SelectItem key={candidate.id} value={candidate.id.toString()}>
                    {candidate.name} ({candidate.match}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="md:col-span-5">
            <Button className="w-full" onClick={handleCompare}>
              Compare Candidates
            </Button>
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-4">Comparison Results</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
              <Briefcase className="h-10 w-10 text-primary mb-2" />
              <span className="text-sm text-muted-foreground">Experience</span>
              <div className="flex items-center gap-4 mt-2">
                <div className="text-center">
                  <span className="text-lg font-bold">8 yrs</span>
                  <p className="text-xs text-muted-foreground">{getCandidateName(candidate1)}</p>
                </div>
                <div className="text-center">
                  <span className="text-lg font-bold">5 yrs</span>
                  <p className="text-xs text-muted-foreground">{getCandidateName(candidate2)}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
              <GraduationCap className="h-10 w-10 text-primary mb-2" />
              <span className="text-sm text-muted-foreground">Education</span>
              <div className="flex items-center gap-4 mt-2">
                <div className="text-center">
                  <span className="text-lg font-bold">Master's</span>
                  <p className="text-xs text-muted-foreground">{getCandidateName(candidate1)}</p>
                </div>
                <div className="text-center">
                  <span className="text-lg font-bold">Bachelor's</span>
                  <p className="text-xs text-muted-foreground">{getCandidateName(candidate2)}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
              <Award className="h-10 w-10 text-primary mb-2" />
              <span className="text-sm text-muted-foreground">Match Score</span>
              <div className="flex items-center gap-4 mt-2">
                <div className="text-center">
                  <span className="text-lg font-bold">92%</span>
                  <p className="text-xs text-muted-foreground">{getCandidateName(candidate1)}</p>
                </div>
                <div className="text-center">
                  <span className="text-lg font-bold">87%</span>
                  <p className="text-xs text-muted-foreground">{getCandidateName(candidate2)}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RechartBarChart
                data={comparisonData}
                layout="vertical"
              >
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="category" type="category" width={120} />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="candidate1" 
                  name={getCandidateName(candidate1)} 
                  fill="#3B82F6" 
                />
                <Bar 
                  dataKey="candidate2" 
                  name={getCandidateName(candidate2)} 
                  fill="#10B981" 
                />
              </RechartBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateComparison;
