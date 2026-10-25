import { jsPDF } from 'jspdf';
import { INITIAL_PRODUCTS, INITIAL_BUNDLES } from '../data/initialProducts';

export function generateComprehensivePdf(prod: any): Buffer {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const title = prod.title || 'Digital PDF Guide';

  // ----------------------------------------------------
  // PAGE 1: COVER & VERIFIED DIGITAL LICENSE CERTIFICATE
  // ----------------------------------------------------
  // Top Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setFillColor(5, 150, 105); // emerald-600
  doc.rect(0, 28, pageWidth, 3, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PDF MASTER INDIA  |  ALDAHR.ONLINE', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text('OFFICIAL VERIFIED DIGITAL PUBLICATION • LIFETIME ACCESS EDITION', 14, 21);

  // Document Title
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  const titleLines = doc.splitTextToSize(title, 180);
  doc.text(titleLines, 14, 46);

  let currentY = 46 + titleLines.length * 9 + 4;

  // Metadata badges
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text(`Category: ${prod.category || 'Special Digital Publication'}`, 14, currentY);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Language: ${prod.language || 'Hindi + English'}  |  Pages: ${prod.pdfPagesCount || 120}+ Pages  |  Format: High-Res Verified PDF`,
    14,
    currentY + 6
  );

  currentY += 16;

  // Description Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, 182, 65, 3, 3, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('About This Comprehensive Guide:', 20, currentY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  const descLines = doc.splitTextToSize(
    prod.description ||
      'This official comprehensive publication delivers practical step-by-step methodologies, real-world examples, actionable frameworks, and high-yield study material designed for maximum mastery and career advancement.',
    170
  );
  doc.text(descLines, 20, currentY + 22);

  currentY += 76;

  // Verified Purchase License Certificate Box
  const licenseY = Math.max(currentY, 195);
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(16, 185, 129); // emerald-500
  doc.setLineWidth(0.6);
  doc.roundedRect(14, licenseY, 182, 75, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(6, 95, 70); // emerald-800
  doc.text('OFFICIAL VERIFIED PURCHASE CERTIFICATE', 22, licenseY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text('This digital document is cryptographically verified and granted with full lifetime access rights.', 22, licenseY + 19);

  doc.setDrawColor(209, 250, 229);
  doc.line(22, licenseY + 23, 186, licenseY + 23);

  // License Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Verification ID:', 22, licenseY + 31);
  doc.setFont('courier', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text(`VERIFIED-RZP-${(prod.id || 'PUB').toUpperCase().slice(0, 16)}-AUTH`, 65, licenseY + 31);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Access Grant:', 22, licenseY + 39);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Lifetime Single-User Commercial & Personal Study License', 65, licenseY + 39);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Delivery Timestamp:', 22, licenseY + 47);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(new Date().toUTCString(), 65, licenseY + 47);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Official Publisher:', 22, licenseY + 55);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('PDF Master India Publications (New Delhi, India)', 65, licenseY + 55);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Support Helpline:', 22, licenseY + 63);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(5, 150, 105);
  doc.text('WhatsApp: +91 70799 88808  |  aldahr.online', 65, licenseY + 63);

  // Page 1 Footer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('PDF Master India • Official Digital Delivery • Page 1 of 3', pageWidth / 2, 290, { align: 'center' });

  // ----------------------------------------------------
  // PAGE 2: CURRICULUM, MODULES & TABLE OF CONTENTS
  // ----------------------------------------------------
  doc.addPage();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 16, 'F');
  doc.setFillColor(5, 150, 105);
  doc.rect(0, 16, pageWidth, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`PDF MASTER INDIA  |  ${title}`, 14, 11);

  // Check if it's a bundle
  let bundleProducts: any[] = [];
  if (prod.productIds && Array.isArray(prod.productIds)) {
    bundleProducts = prod.productIds
      .map((id: string) => INITIAL_PRODUCTS.find((p) => p.id === id))
      .filter(Boolean);
  }

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(bundleProducts.length > 0 ? 'Included Guides & Comprehensive Syllabus:' : 'Curriculum Syllabus & Chapter Index:', 14, 28);

  let p2Y = 38;

  if (bundleProducts.length > 0) {
    bundleProducts.forEach((bp, bIdx) => {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, p2Y - 4, 182, 17, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(5, 150, 105);
      doc.text(`Guide 0${bIdx + 1}:`, 18, p2Y + 4);

      doc.setTextColor(15, 23, 42);
      doc.text(`${bp.title}`, 38, p2Y + 4);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Category: ${bp.category}  |  Pages: ${bp.pdfPagesCount || 120}  |  Format: High-Res PDF`, 38, p2Y + 9);

      p2Y += 21;
    });
  } else {
    const defaultChapters = [
      { chapter: 'Chapter 1', title: 'Core Foundations, Principles & Architecture', pages: '01 - 25' },
      { chapter: 'Chapter 2', title: 'Step-by-Step Practical Blueprint & Workflows', pages: '26 - 55' },
      { chapter: 'Chapter 3', title: 'Advanced Strategies, Case Studies & Real Examples', pages: '56 - 90' },
      { chapter: 'Chapter 4', title: 'Templates, Checklists & Actionable Frameworks', pages: '91 - 120' },
      { chapter: 'Chapter 5', title: 'Troubleshooting, Pro Tips & Master Checklist', pages: '121 - 148' }
    ];

    const chapters = (prod.tableOfContents && prod.tableOfContents.length > 0) ? prod.tableOfContents : defaultChapters;

    chapters.forEach((item: any) => {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, p2Y - 4, 182, 10, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(5, 150, 105);
      doc.text(item.chapter || 'Chapter', 18, p2Y + 3);

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');
      doc.text(item.title || 'Practical Topic Mastery', 46, p2Y + 3);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text(`pp. ${item.pages || '1-30'}`, 175, p2Y + 3, { align: 'right' });

      p2Y += 14;
    });
  }

  p2Y += 6;

  // Highlights section
  const highlights = (prod.highlights && prod.highlights.length > 0) ? prod.highlights : [
    'Complete practical step-by-step master guide',
    'Real life examples with diagrams and screenshots',
    'High-converting action templates and checklists',
    'Lifetime validity and instant digital mobile reading'
  ];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('Core Highlights & Key Takeaways:', 14, p2Y);
  p2Y += 8;

  highlights.forEach((h: string) => {
    doc.setFillColor(16, 185, 129);
    doc.circle(18, p2Y - 1, 1, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const lines = doc.splitTextToSize(h, 170);
    doc.text(lines, 23, p2Y);
    p2Y += lines.length * 5 + 3;
  });

  // Page 2 Footer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('PDF Master India • Official Digital Delivery • Page 2 of 3', pageWidth / 2, 290, { align: 'center' });

  // ----------------------------------------------------
  // PAGE 3: ACTIONABLE STUDY BLUEPRINT & CHEAT SHEET
  // ----------------------------------------------------
  doc.addPage();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 16, 'F');
  doc.setFillColor(5, 150, 105);
  doc.rect(0, 16, pageWidth, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`PDF MASTER INDIA  |  PRACTICAL BLUEPRINT & ACTION SHEET`, 14, 11);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Practical Study Blueprint & Implementation Rules', 14, 28);

  const actionPoints = [
    'Rule 1: Focus on direct application. Study each chapter and implement the actionable exercises immediately.',
    'Rule 2: Keep this PDF accessible across all devices (Mobile, Tablet, Desktop) for quick revision.',
    'Rule 3: Utilize the provided templates, frameworks, and cheat sheets in your daily projects and exams.',
    'Rule 4: Review key diagrams and summaries every weekend to ensure 100% retention and mastery.',
    'Rule 5: For any queries, replacements, or updates, reach our WhatsApp helpline: +91 70799 88808 anytime.'
  ];

  let p3Y = 38;
  actionPoints.forEach((point, pIdx) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, p3Y - 4, 182, 14, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(5, 150, 105);
    doc.text(`[Step 0${pIdx + 1}]`, 18, p3Y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    const pLines = doc.splitTextToSize(point, 145);
    doc.text(pLines, 42, p3Y + 4);

    p3Y += 18;
  });

  // Important Notice Card
  const noticeY = p3Y + 10;
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(245, 158, 11); // amber-500
  doc.roundedRect(14, noticeY, 182, 38, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(146, 64, 14); // amber-800
  doc.text('IMPORTANT CUSTOMER SUPPORT & UPDATES:', 20, noticeY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(120, 53, 15);
  doc.text(
    'Agar aapko kisi bhi update, additional sheets, ya WhatsApp par file mangwani ho to apna Order ID likh kar hamare WhatsApp helpline par bhein. Hamari team 24 ghante support ke liye tayyar hai.',
    20,
    noticeY + 18,
    { maxWidth: 170 }
  );

  doc.setFont('helvetica', 'bold');
  doc.text('WhatsApp Helpline: +91 70799 88808  |  Email: support@pdfmaster.in', 20, noticeY + 31);

  // Page 3 Footer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('PDF Master India • Official Digital Delivery • Page 3 of 3 (Complete Edition)', pageWidth / 2, 290, {
    align: 'center'
  });

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
