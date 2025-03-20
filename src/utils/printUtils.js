
import { toast } from "sonner";
import { jsPDF } from "jspdf";

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

export const exportReportAsPDF = (reportName = "Report", contentElement) => {
  toast.info("Generating PDF...");
  
  try {
    // Create a new jsPDF instance
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });
    
    // Set document properties
    doc.setProperties({
      title: reportName,
      subject: "Resume Evaluation Report",
      creator: "Resume Analyzer App"
    });
    
    // Add title
    doc.setFontSize(22);
    doc.text(reportName, 105, 20, { align: "center" });
    
    if (contentElement) {
      // Add report content
      doc.setFontSize(12);
      
      // If we have HTML content to convert
      const htmlContent = contentElement.innerHTML;
      
      if (htmlContent) {
        // Simple conversion of HTML content (Note: this is simplified)
        // For production, consider using html2canvas or similar
        
        // Get plain text from the HTML (removing tags)
        const textContent = contentElement.innerText;
        const lines = textContent.split("\n");
        
        // Add each line to the PDF
        let yPos = 40;
        lines.forEach(line => {
          if (line.trim()) {
            doc.text(line, 20, yPos);
            yPos += 7;
            
            // Add a new page if we're reaching the bottom
            if (yPos > 280) {
              doc.addPage();
              yPos = 20;
            }
          }
        });
      }
    }
    
    // Save the PDF
    doc.save(`${reportName.replace(/\s+/g, "_")}.pdf`);
    
    // Show success message
    toast.success(`${reportName} exported as PDF`);
  } catch (error) {
    console.error("PDF generation failed:", error);
    toast.error("Failed to generate PDF. Please try again.");
  }
};

export const shareReport = (reportName = "Report") => {
  // Using Web Share API if available
  if (navigator.share) {
    navigator.share({
      title: reportName,
      text: `Check out this ${reportName}`,
      url: window.location.href,
    })
    .then(() => toast.success("Report shared successfully"))
    .catch((error) => {
      console.error("Error sharing:", error);
      toast.error("Error sharing report");
    });
  } else {
    // Fallback - copy URL to clipboard
    navigator.clipboard.writeText(window.location.href)
      .then(() => toast.success("Link copied to clipboard"))
      .catch(() => toast.error("Failed to copy link"));
  }
};
