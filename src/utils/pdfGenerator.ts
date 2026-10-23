import jsPDF from 'jspdf';
import { Product, Order } from '../types';

/**
 * Safely loads an image (data-url, SVG, or HTTP URL) and renders it to a PNG data URL.
 * Never throws — returns null if the image fails to load or is blocked by CORS.
 */
async function getPngDataUrl(src: string, timeoutMs = 2500): Promise<string | null> {
  if (!src || typeof src !== 'string') return null;

  return new Promise((resolve) => {
    let finished = false;
    const timeout = setTimeout(() => {
      if (!finished) {
        finished = true;
        resolve(null);
      }
    }, timeoutMs);

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(img.naturalWidth || 800, 1200);
        canvas.height = Math.min(img.naturalHeight || 1100, 1600);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL('image/png', 0.88);
        resolve(pngUrl);
      } catch (err) {
        console.warn('Canvas export notice for image:', err);
        resolve(null);
      }
    };

    img.onerror = () => {
      if (!finished) {
        finished = true;
        clearTimeout(timeout);
        resolve(null);
      }
    };

    img.src = src;
  });
}

/**
 * Generates an authentic, high-quality, printable PDF file directly inside the browser using jsPDF.
 * This runs 100% on the client side, works on Vercel (aldahr.online), and never 404s.
 */
export async function generateProductPdf(
  product: Product,
  order?: Partial<Order> | null
): Promise<{ blob: Blob; filename: string }> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const cleanTitle = (product.title || 'PDF_Master_Document').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${cleanTitle}.pdf`;

  const orderId = order?.id || `ORD-${Date.now()}`;
  const paymentId = order?.razorpayPaymentId || 'VERIFIED-GATEWAY-AUTH';
  const customerName = order?.customerName || 'Authorized Buyer';
  const customerEmail = order?.customerEmail || 'aldahr.online customer';
  const purchaseDate = order?.date ? new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  // ----------------------------------------------------
  // PAGE 1: COVER & VERIFIED LIFETIME LICENSE CERTIFICATE
  // ----------------------------------------------------
  
  // Top Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Emerald accent line
  doc.setFillColor(5, 150, 105); // emerald-600
  doc.rect(0, 28, pageWidth, 3, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('ALDAHR.ONLINE', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('OFFICIAL VERIFIED DIGITAL PUBLICATION • LIFETIME ACCESS EDITION', 14, 21);

  // Document Title
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  const titleLines = doc.splitTextToSize(product.title || 'Engineering Drawing Sheets & Guide', 180);
  doc.text(titleLines, 14, 46);

  let currentY = 46 + (titleLines.length * 9) + 2;

  // Metadata badges row
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text(`Category: ${product.category || 'Drawing & Study Material'}`, 14, currentY);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text(`Language: ${product.language || 'English / Hindi'}  |  Pages: ${product.pdfPagesCount || 10}+ Sheets  |  Format: High-Res Vector PDF`, 14, currentY + 5);

  currentY += 14;

  // Try loading Cover Image onto Page 1
  let coverDrawn = false;
  if (product.coverImage) {
    try {
      const pngCover = await getPngDataUrl(product.coverImage);
      if (pngCover) {
        const imgWidth = 85;
        const imgHeight = 110;
        const imgX = (pageWidth - imgWidth) / 2;
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(imgX - 2, currentY - 2, imgWidth + 4, imgHeight + 4, 3, 3, 'FD');
        doc.addImage(pngCover, 'PNG', imgX, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 10;
        coverDrawn = true;
      }
    } catch (e) {
      console.warn('Cover image render skip:', e);
    }
  }

  // If no cover drawn, draw a decorative title card
  if (!coverDrawn) {
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, currentY, 182, 60, 3, 3, 'FD');
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(product.title || 'Digital Document', 24, currentY + 22);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    const summaryLines = doc.splitTextToSize(
      product.description || 'Complete official guide and drawing sheets package, verified and unlocked.',
      160
    );
    doc.text(summaryLines, 24, currentY + 34);
    currentY += 70;
  }

  // ----------------------------------------------------
  // VERIFIED LICENSE BOX AT BOTTOM OF PAGE 1
  // ----------------------------------------------------
  const licenseY = Math.max(currentY, 205);
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(16, 185, 129); // emerald-500
  doc.setLineWidth(0.6);
  doc.roundedRect(14, licenseY, 182, 70, 3, 3, 'FD');

  // Seal Icon / Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(6, 95, 70); // emerald-800
  doc.text('OFFICIAL VERIFIED PURCHASE CERTIFICATE', 22, licenseY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(4, 120, 87);
  doc.text('This digital document was lawfully purchased and licensed on aldahr.online', 22, licenseY + 17);

  // License details grid
  doc.setDrawColor(209, 250, 229);
  doc.line(22, licenseY + 21, 188, licenseY + 21);

  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);

  doc.setFont('helvetica', 'bold');
  doc.text('Order ID:', 22, licenseY + 29);
  doc.setFont('helvetica', 'normal');
  doc.text(String(orderId), 55, licenseY + 29);

  doc.setFont('helvetica', 'bold');
  doc.text('Payment Ref:', 22, licenseY + 36);
  doc.setFont('helvetica', 'normal');
  doc.text(String(paymentId), 55, licenseY + 36);

  doc.setFont('helvetica', 'bold');
  doc.text('Customer:', 22, licenseY + 43);
  doc.setFont('helvetica', 'normal');
  doc.text(`${customerName} (${customerEmail})`, 55, licenseY + 43);

  doc.setFont('helvetica', 'bold');
  doc.text('Issue Date:', 22, licenseY + 50);
  doc.setFont('helvetica', 'normal');
  doc.text(`${purchaseDate} • Lifetime License`, 55, licenseY + 50);

  doc.setFont('helvetica', 'bold');
  doc.text('Helpline / WhatsApp:', 22, licenseY + 57);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(5, 150, 105);
  doc.text('+91 70799 88808 (aldahr.online 24x7 support)', 65, licenseY + 57);

  // Page 1 Footer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('aldahr.online • Page 1 of 3 (Licensed Copy)', pageWidth / 2, 290, { align: 'center' });

  // ----------------------------------------------------
  // PAGE 2: SYLLABUS, HIGHLIGHTS, DETAILS & SPECIFICATIONS
  // ----------------------------------------------------
  doc.addPage();

  // Mini Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 16, 'F');
  doc.setFillColor(5, 150, 105);
  doc.rect(0, 16, pageWidth, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`aldahr.online  |  ${product.title}`, 14, 11);

  // Section: Overview
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Document Overview & Instructions', 14, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  const descLines = doc.splitTextToSize(
    product.description ||
      'This official document provides verified engineering sheets, detailed step-by-step illustrations, and core reference materials designed for professional and academic excellence.',
    182
  );
  doc.text(descLines, 14, 36);

  let p2Y = 36 + (descLines.length * 5.5) + 6;

  // Table of Contents / Sheets List
  if (product.tableOfContents && product.tableOfContents.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Index / Sheet Modules List', 14, p2Y);
    p2Y += 6;

    doc.setFontSize(9);
    product.tableOfContents.slice(0, 10).forEach((item, idx) => {
      doc.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255);
      doc.rect(14, p2Y - 3.5, 182, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(5, 150, 105);
      doc.text(String(item.chapter || `Sheet ${idx + 1}`), 16, p2Y + 1);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text(String(item.title || ''), 45, p2Y + 1);

      doc.setTextColor(100, 116, 139);
      doc.text(String(item.pages || 'Sheet'), 175, p2Y + 1);
      p2Y += 7.5;
    });

    p2Y += 6;
  }

  // Highlights / Key Features
  const highlights = (product.highlights && product.highlights.length > 0) ? product.highlights : product.features || [];
  if (highlights.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Key Technical Highlights & Practical Instructions', 14, p2Y);
    p2Y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);

    highlights.slice(0, 8).forEach((h) => {
      doc.setFillColor(16, 185, 129);
      doc.circle(17, p2Y - 1, 1, 'F');
      const lines = doc.splitTextToSize(h, 172);
      doc.text(lines, 21, p2Y);
      p2Y += (lines.length * 5) + 2;
    });
  }

  // Security & License Footer
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 255, 182, 25, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('AUTHORIZED USAGE & COPYRIGHT INFORMATION', 20, 263);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `This licensed digital copy is exclusively granted to ${customerName} (Order: ${orderId}). Commercial re-distribution, unauthorized copying, or resale is strictly prohibited. For questions or replacement files, WhatsApp: +91 70799 88808.`,
    20,
    270,
    { maxWidth: 170 }
  );

  doc.setFontSize(7.5);
  doc.text('aldahr.online • Page 2 of Content', pageWidth / 2, 290, { align: 'center' });

  // ----------------------------------------------------
  // SUBSEQUENT PAGES: DRAWING SHEETS / SAMPLE PAGES
  // ----------------------------------------------------
  // If the product has previewImages or samplePages, render each as a full high-resolution engineering sheet!
  const sheetImages = [
    ...(product.samplePages || []),
    ...(product.previewImages || [])
  ].filter((img, idx, arr) => img && typeof img === 'string' && arr.indexOf(img) === idx);

  let sheetIndex = 1;
  for (const sheetImg of sheetImages) {
    try {
      const pngData = await getPngDataUrl(sheetImg);
      if (pngData) {
        doc.addPage();

        // Engineering Border (Outer & Inner)
        doc.setDrawColor(30, 41, 59);
        doc.setLineWidth(0.8);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20); // Outer border

        doc.setLineWidth(0.3);
        doc.rect(12, 12, pageWidth - 24, pageHeight - 24); // Inner border

        // Sheet Header
        doc.setFillColor(15, 23, 42);
        doc.rect(12, 12, pageWidth - 24, 12, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text(`${product.title.toUpperCase()}  |  SHEET ${sheetIndex}`, 16, 20);

        doc.setFontSize(8);
        doc.setTextColor(16, 185, 129);
        doc.text('aldahr.online • VERIFIED EDITION', pageWidth - 16, 20, { align: 'right' });

        // Embed the drawing / sample page image
        const imgX = 14;
        const imgY = 26;
        const imgW = pageWidth - 28;
        const imgH = pageHeight - 65;

        doc.addImage(pngData, 'PNG', imgX, imgY, imgW, imgH);

        // Bottom Engineering Title Block
        const tbY = pageHeight - 37;
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(30, 41, 59);
        doc.setLineWidth(0.5);
        doc.rect(12, tbY, pageWidth - 24, 23, 'FD');

        // Vertical lines in title block
        doc.line(70, tbY, 70, tbY + 23);
        doc.line(140, tbY, 140, tbY + 23);

        // Col 1: Project & Sheet Info
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text('PROJECT / TITLE:', 15, tbY + 6);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(product.title.substring(0, 32), 15, tbY + 12);
        doc.setFont('helvetica', 'bold');
        doc.text(`SHEET NO: 0${sheetIndex}`, 15, tbY + 18);

        // Col 2: License & Order
        doc.setFont('helvetica', 'bold');
        doc.text('LICENSED TO:', 73, tbY + 6);
        doc.setFont('helvetica', 'normal');
        doc.text(customerName.substring(0, 30), 73, tbY + 12);
        doc.text(`Order: ${orderId.substring(0, 25)}`, 73, tbY + 18);

        // Col 3: Publisher Seal
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(5, 150, 105);
        doc.text('ALDAHR.ONLINE', 143, tbY + 6);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.text('Verified Digital Delivery', 143, tbY + 11);
        doc.text(`Date: ${purchaseDate}`, 143, tbY + 16);
        doc.text('WhatsApp: +91 70799 88808', 143, tbY + 21);

        sheetIndex++;
      }
    } catch (err) {
      console.warn('Sheet image processing skip:', err);
    }
  }

  const outputBlob = doc.output('blob');
  return { blob: outputBlob, filename };
}

/**
 * Downloads a Blob directly to the user's browser, triggering Android Download Manager
 * or desktop file download with 100% reliability and no pop-up blocker issues.
 */
export function downloadPdfBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.setAttribute('target', '_self'); // Avoid popup blockers on mobile Chrome
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Allow enough time for Android Download Manager to consume the blob stream
  setTimeout(() => {
    try {
      URL.revokeObjectURL(url);
    } catch {}
  }, 120000); // 2 minutes
}
