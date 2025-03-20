
import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { 
  Filter, 
  Search,
  FilterX,
} from "lucide-react";

interface ResumeFilterProps {
  onFilterChange: (filters: {
    skill?: string;
    experience?: string;
    score?: string;
    showTopCandidatesOnly: boolean;
  }) => void;
}

const ResumeFilter = ({ onFilterChange }: ResumeFilterProps) => {
  const [skill, setSkill] = React.useState<string>("");
  const [experience, setExperience] = React.useState<string>("");
  const [score, setScore] = React.useState<string>("");
  const [showTopCandidatesOnly, setShowTopCandidatesOnly] = React.useState(false);

  const handleApplyFilters = () => {
    onFilterChange({
      skill,
      experience,
      score,
      showTopCandidatesOnly
    });
  };

  const handleResetFilters = () => {
    setSkill("");
    setExperience("");
    setScore("");
    setShowTopCandidatesOnly(false);
    onFilterChange({
      showTopCandidatesOnly: false
    });
  };

  return (
    <div className="bg-card rounded-lg border shadow-subtle p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-medium">Filter Candidates</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Primary Skill</label>
          <Select value={skill} onValueChange={setSkill}>
            <SelectTrigger>
              <SelectValue placeholder="Select skill" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="programming">Programming</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="communication">Communication</SelectItem>
              <SelectItem value="problem-solving">Problem Solving</SelectItem>
              <SelectItem value="teamwork">Teamwork</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Experience</label>
          <Select value={experience} onValueChange={setExperience}>
            <SelectTrigger>
              <SelectValue placeholder="Years of experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-1">0-1 Years</SelectItem>
              <SelectItem value="2-3">2-3 Years</SelectItem>
              <SelectItem value="4-5">4-5 Years</SelectItem>
              <SelectItem value="6-10">6-10 Years</SelectItem>
              <SelectItem value="10+">10+ Years</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Score Range</label>
          <Select value={score} onValueChange={setScore}>
            <SelectTrigger>
              <SelectValue placeholder="Select score range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="90-100">90-100%</SelectItem>
              <SelectItem value="80-89">80-89%</SelectItem>
              <SelectItem value="70-79">70-79%</SelectItem>
              <SelectItem value="60-69">60-69%</SelectItem>
              <SelectItem value="<60">Below 60%</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col justify-end space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="top-candidates" 
              checked={showTopCandidatesOnly}
              onCheckedChange={(checked) => 
                setShowTopCandidatesOnly(checked === true)
              }
            />
            <label 
              htmlFor="top-candidates" 
              className="text-sm cursor-pointer"
            >
              Show top candidates only
            </label>
          </div>
          
          <div className="flex space-x-2 mt-2">
            <Button onClick={handleApplyFilters} size="sm" className="w-full">
              <Search className="h-4 w-4 mr-1" />
              Apply
            </Button>
            <Button 
              onClick={handleResetFilters} 
              variant="outline" 
              size="sm"
              className="w-full"
            >
              <FilterX className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeFilter;
