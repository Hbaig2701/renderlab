'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

interface ROIReportButtonProps {
  visualizerId: string;
  clientName: string;
  templateName: string;
  totalConsultations: number;
  weekConsultations: number;
  createdAt: string;
}

export function ROIReportButton({
  visualizerId,
  clientName,
  templateName,
  totalConsultations,
  weekConsultations,
  createdAt,
}: ROIReportButtonProps) {
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Colors
      const primaryColor: [number, number, number] = [245, 158, 11]; // #F59E0B
      const textColor: [number, number, number] = [51, 51, 51];
      const mutedColor: [number, number, number] = [128, 128, 128];

      // Header
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('RenderLab', 20, 25);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Visualizer Performance Report', pageWidth - 20, 25, { align: 'right' });

      // Client Info
      doc.setTextColor(...textColor);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(clientName, 20, 60);

      doc.setFontSize(12);
      doc.setTextColor(...mutedColor);
      doc.setFont('helvetica', 'normal');
      doc.text(templateName, 20, 70);
      doc.text(`Report generated: ${new Date().toLocaleDateString()}`, 20, 78);

      // Divider
      doc.setDrawColor(230, 230, 230);
      doc.line(20, 85, pageWidth - 20, 85);

      // Stats Section
      doc.setTextColor(...textColor);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Performance Metrics', 20, 100);

      // Stats boxes
      const statsY = 110;
      const boxWidth = (pageWidth - 60) / 3;

      // Total Consultations
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(20, statsY, boxWidth, 40, 3, 3, 'F');
      doc.setFontSize(10);
      doc.setTextColor(...mutedColor);
      doc.text('Total Consultations', 20 + boxWidth / 2, statsY + 12, { align: 'center' });
      doc.setFontSize(24);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(totalConsultations.toString(), 20 + boxWidth / 2, statsY + 30, { align: 'center' });

      // Last 7 Days
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(30 + boxWidth, statsY, boxWidth, 40, 3, 3, 'F');
      doc.setFontSize(10);
      doc.setTextColor(...mutedColor);
      doc.setFont('helvetica', 'normal');
      doc.text('Last 7 Days', 30 + boxWidth + boxWidth / 2, statsY + 12, { align: 'center' });
      doc.setFontSize(24);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(weekConsultations.toString(), 30 + boxWidth + boxWidth / 2, statsY + 30, { align: 'center' });

      // Days Active
      const daysActive = Math.ceil(
        (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(40 + boxWidth * 2, statsY, boxWidth, 40, 3, 3, 'F');
      doc.setFontSize(10);
      doc.setTextColor(...mutedColor);
      doc.setFont('helvetica', 'normal');
      doc.text('Days Active', 40 + boxWidth * 2 + boxWidth / 2, statsY + 12, { align: 'center' });
      doc.setFontSize(24);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(daysActive.toString(), 40 + boxWidth * 2 + boxWidth / 2, statsY + 30, { align: 'center' });

      // ROI Estimation Section
      doc.setTextColor(...textColor);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Estimated ROI Impact', 20, 175);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...mutedColor);

      const avgConversionLift = 0.2; // 20%
      const estimatedLeads = Math.round(totalConsultations * avgConversionLift);

      const roiText = [
        `Based on industry benchmarks, visualization tools typically improve`,
        `conversion rates by 15-30%. With ${totalConsultations} total consultations:`,
        '',
        `• Estimated additional leads generated: ${estimatedLeads}`,
        `• Average conversion improvement: 20%`,
        `• Customer engagement: High (interactive visualization)`,
      ];

      let y = 185;
      roiText.forEach((line) => {
        doc.text(line, 20, y);
        y += 8;
      });

      // Value Proposition
      doc.setFillColor(255, 251, 235); // Light amber
      doc.roundedRect(20, 230, pageWidth - 40, 35, 3, 3, 'F');
      doc.setTextColor(...primaryColor);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Key Value:', 25, 245);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textColor);
      doc.text(
        'This visualizer helps potential customers visualize results before committing,',
        65,
        245
      );
      doc.text('significantly reducing decision friction and increasing conversions.', 25, 255);

      // Footer
      doc.setDrawColor(230, 230, 230);
      doc.line(20, 280, pageWidth - 20, 280);
      doc.setFontSize(9);
      doc.setTextColor(...mutedColor);
      doc.text(`Visualizer ID: ${visualizerId}`, 20, 288);
      doc.text('Powered by RenderLab', pageWidth - 20, 288, { align: 'right' });

      // Save the PDF
      doc.save(`${clientName.replace(/\s+/g, '-')}-ROI-Report.pdf`);
      toast.success('Report downloaded!');
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report');
    }

    setLoading(false);
  };

  return (
    <Button variant="outline" onClick={generateReport} disabled={loading}>
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FileText className="mr-2 h-4 w-4" />
      )}
      Download ROI Report
    </Button>
  );
}
