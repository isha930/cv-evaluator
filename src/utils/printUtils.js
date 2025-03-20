
import { toast } from "sonner";

export const printReport = (reportName = "Report") => {
  // Show a toast message
  toast.info("Preparing report for printing...");
  
  // Add a small delay to allow the toast to show
  setTimeout(() => {
    // Save current scroll position
    const scrollPos = window.scrollY;
    
    // Add a temporary class to optimize for printing
    document.body.classList.add("printing-report");
    
    // Print the page
    window.print();
    
    // Remove the printing class after printing
    document.body.classList.remove("printing-report");
    
    // Restore scroll position
    window.scrollTo(0, scrollPos);
    
    // Show success toast
    toast.success(`${reportName} sent to printer`);
  }, 500);
};

export const exportReportAsPDF = (reportName = "Report") => {
  // This is a mock function - in a real app this would use a library like jsPDF
  toast.info("Preparing PDF export...");
  
  setTimeout(() => {
    toast.success(`${reportName} exported as PDF`);
  }, 1000);
};

export const shareReport = (reportName = "Report") => {
  // This is a mock function - in a real app this would use the Web Share API or a custom sharing solution
  if (navigator.share) {
    navigator.share({
      title: reportName,
      text: `Check out this ${reportName}`,
      url: window.location.href,
    })
    .then(() => toast.success("Report shared successfully"))
    .catch((error) => toast.error("Error sharing report"));
  } else {
    // Fallback - copy URL to clipboard
    navigator.clipboard.writeText(window.location.href)
      .then(() => toast.success("Link copied to clipboard"))
      .catch(() => toast.error("Failed to copy link"));
  }
};
