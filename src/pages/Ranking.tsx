
import React from "react";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import RankingTable from "@/components/RankingTable";
import LoadingState from "@/components/ranking/LoadingState";
import EmptyState from "@/components/ranking/EmptyState";
import RankingHeader from "@/components/ranking/RankingHeader";
import TopCandidates from "@/components/ranking/TopCandidates";
import RankingOverview from "@/components/ranking/RankingOverview";
import ResumeDetailDialog from "@/components/ranking/ResumeDetailDialog";
import { useResumeRanking } from "@/hooks/useResumeRanking";

const Ranking = () => {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");
  
  const {
    resumeDataList,
    jobTitle,
    isLoading,
    selectedResume,
    isDialogOpen,
    setIsDialogOpen,
    handleRankUp,
    handleRankDown,
    handleView,
    handleExport,
    stats
  } = useResumeRanking(jobId);
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-5xl mx-auto fade-in">
          <RankingHeader jobTitle={jobTitle} onExport={handleExport} />
          
          {isLoading ? (
            <LoadingState />
          ) : resumeDataList.length === 0 ? (
            <EmptyState hasJobId={!!jobId} />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              <div className="xl:col-span-8 overflow-auto bg-card rounded-lg shadow-subtle border">
                <RankingTable 
                  resumes={resumeDataList}
                  onRankUp={handleRankUp}
                  onRankDown={handleRankDown}
                  onView={handleView}
                />
              </div>
              
              <div className="xl:col-span-4 space-y-6">
                <TopCandidates 
                  candidates={resumeDataList.slice(0, 3)} 
                  onView={handleView} 
                />
                
                <RankingOverview 
                  totalCandidates={stats.totalCandidates}
                  averageScore={stats.averageScore}
                  topPerformer={stats.topPerformer}
                />
              </div>
            </div>
          )}
        </div>
      </main>
      
      <ResumeDetailDialog
        resume={selectedResume}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onRankUp={handleRankUp}
        onRankDown={handleRankDown}
      />
    </div>
  );
};

export default Ranking;
