import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

const uploadsDir = path.resolve(process.cwd(), '.data/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

interface DocDef {
  fileName: string;
  title: string;
  category: string;
  pages: { title: string; content: string[] }[];
}

const docsToSeed: DocDef[] = [
  {
    fileName: 'chatgpt_ai_tools_master_guide.pdf',
    title: 'ChatGPT & AI Tools Master Guide 2026',
    category: 'Artificial Intelligence & Productivity',
    pages: [
      {
        title: 'Chapter 1: The Core Architecture of Prompt Engineering',
        content: [
          'Welcome to the official verified edition of ChatGPT & AI Tools Master Guide.',
          'Prompt engineering is the art of structuring words to elicit precise, actionable responses from large language models.',
          '',
          '1. THE C-T-C-O FRAMEWORK (Context, Task, Constraints, Output):',
          ' - Context: Who you are, the environment, and the audience.',
          ' - Task: Exactly what needs to be created or analyzed.',
          ' - Constraints: Length limits, tone rules, things to avoid.',
          ' - Output Format: Table, JSON, markdown, bullet points, step-by-step.',
          '',
          '2. ZERO-SHOT VS FEW-SHOT REASONING:',
          ' - Zero-shot: Asking directly without prior examples.',
          ' - Few-shot: Providing 2 to 3 exemplary input-output pairs before asking the model to perform.',
          ' - Chain-of-Thought: Prompting the model to "Think step-by-step before answering".',
          '',
          '3. BEST PRACTICE CHECKLIST:',
          ' [x] Use active verbs: Write, summarize, analyze, compare, optimize.',
          ' [x] Specify format explicitly: "Return as a 4-column Markdown table".',
          ' [x] Never leave ambiguity: State reading level, word count, and tone.'
        ]
      },
      {
        title: 'Chapter 2: 25 Plug-and-Play Prompts for Maximum Productivity',
        content: [
          'PRACTICAL PROMPTS FOR DAILY WORK AND STUDY:',
          '',
          'Prompt 01: Executive Summary Generator',
          '"Analyze the following text and create a 3-bullet executive summary highlighting key findings, risks, and recommended immediate actions: [PASTE TEXT]"',
          '',
          'Prompt 02: High-Converting Email Outreach',
          '"Write a 75-word cold outreach email to a decision maker offering our design services. Keep subject line under 6 words with 0 spam triggers."',
          '',
          'Prompt 03: Fast Complex Topic Breakdown',
          '"Explain quantum computing to a high school sophomore using everyday kitchen analogies."',
          '',
          'Prompt 04: Code Debugger & Explainer',
          '"Review this TypeScript code for memory leaks, performance bottlenecks, and edge case bugs: [PASTE CODE]"',
          '',
          'Prompt 05: Meeting Minutes to Action Items',
          '"Convert the following meeting notes into an action matrix with columns: Task, Owner, Deadline, Priority Level."'
        ]
      },
      {
        title: 'Chapter 3: Mastering Emerging AI Models (Claude, Midjourney, Gamma)',
        content: [
          'TOP AI TOOLS COMPARISON MATRIX:',
          '',
          '1. CLAUDE 3.5 SONNET:',
          ' - Best for: Coding, nuanced technical writing, artifact building.',
          ' - Context Window: 200,000 tokens (equivalent to full books).',
          '',
          '2. MIDJOURNEY v6:',
          ' - Best for: Photorealistic imagery, cinematic lighting, book cover design.',
          ' - Parameters: --ar 16:9, --v 6.0, --style raw.',
          '',
          '3. GAMMA APP:',
          ' - Best for: AI-generated slide presentations and responsive web docs in seconds.',
          '',
          '4. ELEVENLABS & SUNO:',
          ' - Voice cloning and AI music composition for viral video content.'
        ]
      }
    ]
  },
  {
    fileName: 'drawing_sheet_1.pdf',
    title: 'Engineering Drawing Sheet 01 - Orthographic Projections',
    category: 'Engineering & Architecture Graphics',
    pages: [
      {
        title: 'Sheet 01: First Angle & Third Angle Projections',
        content: [
          'BUREAU OF INDIAN STANDARDS (BIS SP: 46 - 2003 COMPLIANT)',
          'Title: Multiview Orthographic Projections & Standard Principles',
          '',
          '1. PROJECTION FUNDAMENTALS:',
          ' - First Angle Projection: Object is placed in 1st Quadrant (Object lies between observer and plane).',
          '   * Plan (Top View) lies BELOW Front Elevation.',
          '   * Left View lies on the RIGHT side of Front View.',
          ' - Third Angle Projection: Object is in 3rd Quadrant (Plane lies between observer and object).',
          '   * Plan lies ABOVE Front Elevation.',
          '   * Left View lies on the LEFT side of Front View.',
          '',
          '2. STANDARD LINE TYPES & CONVENTIONS:',
          ' - Continuous Thick Line (0.5mm): Visible outlines and edges.',
          ' - Continuous Thin Line (0.2mm): Dimension lines, extension lines, hatching lines.',
          ' - Dashed Medium Line (0.35mm): Hidden outlines and hidden edges.',
          ' - Long-dashed Dotted Thin (0.2mm): Centerlines, axes of symmetry, pitch circles.',
          '',
          '3. DIMENSIONING RULES:',
          ' - Always place dimension figures above and clear of the dimension line (Aligned System).',
          ' - Extension lines must extend ~3mm beyond the dimension lines.',
          ' - Arrowheads must have length-to-depth ratio of 3:1.'
        ]
      },
      {
        title: 'Sheet 01 - Technical Exercises & Title Block',
        content: [
          'PRACTICE PROBLEMS & ASSIGNMENTS:',
          '',
          'Problem 1: Given isometric block with dimensions 60 x 40 x 30 mm having a central step of 20 x 20 mm.',
          'Draw the following views to scale 1:1 in First Angle Projection:',
          ' a) Front Elevation looking in direction of arrow X.',
          ' b) Top View (Plan).',
          ' c) Side Elevation from left.',
          '',
          'TITLE BLOCK SPECIFICATION (185 mm x 65 mm):',
          ' [ NAME OF INSTITUTION / PUBLISHER: ALDAHR.ONLINE ]',
          ' [ TITLE: ENGINEERING DRAWING SHEET 01 ]',
          ' [ SCALE: 1:1 | PROJECTION: FIRST ANGLE | SHEET NO: 01 ]',
          ' [ CHECKED BY: VERIFIED CHIEF EXAMINER ]'
        ]
      }
    ]
  },
  {
    fileName: 'drawing_sheet_2.pdf',
    title: 'Engineering Drawing Sheet 02 - Sectional Views & Fasteners',
    category: 'Mechanical & Civil Engineering Graphics',
    pages: [
      {
        title: 'Sheet 02: Principles of Sectioning and Cutting Planes',
        content: [
          'TOPIC: SECTIONAL ELEVATIONS, HATCHING CONVENTIONS & THREAD PROFILES',
          '',
          '1. CUTTING PLANE PRINCIPLES:',
          ' - A cutting plane is represented by a thin chain line with thick ends and arrows indicating viewing direction.',
          ' - Material cut by the plane is hatched using thin continuous lines at 45 degrees to the main outlines.',
          ' - Distance between hatching lines should be uniform (1.5mm to 3mm).',
          '',
          '2. TYPES OF SECTIONS:',
          ' - Full Section: Cutting plane passes entirely through the component.',
          ' - Half Section: Applied to symmetrical objects (half exterior, half interior).',
          ' - Offset Section: Cutting plane bends at right angles to pass through multiple features.',
          ' - Revolved & Removed Sections: For spokes, ribs, shafts, and crane hooks.',
          '',
          '3. STANDARD FASTENERS:',
          ' - Hexagonal Bolt & Nut: D = nominal diameter, Head thickness = 0.8D, Across flats = 1.5D + 3mm.',
          ' - Metric Screw Thread (ISO 68-1): 60 degree included angle, P = pitch.'
        ]
      }
    ]
  },
  {
    fileName: 'drawing_sheet_3.pdf',
    title: 'Engineering Drawing Sheet 03 - Isometric Projections & Assemblies',
    category: 'Advanced CAD & Engineering Blueprints',
    pages: [
      {
        title: 'Sheet 03: Isometric Scales and Isometric Views',
        content: [
          'TOPIC: ISOMETRIC PROJECTION VS ISOMETRIC VIEW',
          '',
          '1. MATHEMATICAL BASIS:',
          ' - Isometric Length = True Length x cos(45) / cos(30) = sqrt(2/3) x True Length ≈ 0.816 x True Length.',
          ' - Isometric View is drawn using true dimensions along 30-degree isometric axes.',
          ' - Isometric Projection is drawn using the reduced isometric scale (81.6%).',
          '',
          '2. FOUR-CENTER METHOD FOR ISOMETRIC CIRCLES (ELLIPSES):',
          ' Step 1: Enclose the circle of diameter D in an isometric rhombus of side D.',
          ' Step 2: From obtuse corners, draw lines to midpoints of opposite sides.',
          ' Step 3: Use intersection points as centers to draw 4 connecting circular arcs.',
          '',
          '3. ASSEMBLY TOLERANCES & FITS (ISO 286):',
          ' - Clearance Fit: Hole minimum size > Shaft maximum size.',
          ' - Transition Fit: Tolerance zones overlap.',
          ' - Interference Fit: Shaft minimum size > Hole maximum size.'
        ]
      }
    ]
  },
  {
    fileName: 'canva_master_guide.pdf',
    title: 'Canva Pro Design Mastery 2026',
    category: 'Graphic Design & Social Media',
    pages: [
      {
        title: 'Chapter 1: Visual Hierarchy and Grid Foundations',
        content: [
          'Design is not just what it looks like; design is how visual communication works.',
          '',
          '1. THE RULE OF THIRDS & THE F-PATTERN:',
          ' - Place key focal points along horizontal and vertical third-lines.',
          ' - Mobile readers scan in an F-shaped trajectory: Top headline -> Subhead -> First button.',
          '',
          '2. TYPOGRAPHIC SCALE (The 3-Font Maximum):',
          ' - Header Font: Bold, high personality (Montserrat, Oswald, Playfair).',
          ' - Body Font: Clean, neutral readability (Inter, Open Sans, Roboto).',
          ' - Accent Font: Handwritten or italic (use on fewer than 5 words per banner).',
          '',
          '3. COLOR HARMONY (60-30-10 RULE):',
          ' - 60% Dominant background color (white, light slate, or dark navy).',
          ' - 30% Structural secondary color (slate gray, card fills, borders).',
          ' - 10% High-contrast accent color (emerald green, vibrant orange for CTAs).'
        ]
      }
    ]
  },
  {
    fileName: 'english_speaking_complete_course.pdf',
    title: 'English Speaking & Daily Communication Mastery',
    category: 'Language & Fluency',
    pages: [
      {
        title: 'Module 1: 50 Daily Situational Dialogues & Fluency Hacks',
        content: [
          'Learn spoken English through real-life conversational dialogues and sentence structures.',
          '',
          'SITUATION 1: Professional Introductions & First Impressions',
          ' - "Good morning, glad to connect with you. I head marketing initiatives at..."',
          ' - "Could you tell me a little more about your recent project?"',
          '',
          'SITUATION 2: Expressing Agreement & Respectful Disagreement',
          ' - "I see where you are coming from, however let us consider the deadline implications."',
          ' - "That is a valid point. How do we plan to address the user feedback?"',
          '',
          'SITUATION 3: Daily Conversation Starters',
          ' - "How is your week shaping up?"',
          ' - "Did you get a chance to review the document I shared earlier?"',
          '',
          'FLUENCY RULE:',
          ' Never translate word-by-word from Hindi. Think in complete phrase chunks and collocations.'
        ]
      }
    ]
  }
];

function buildPdf(docDef: DocDef): Buffer {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;

  docDef.pages.forEach((page, pIdx) => {
    if (pIdx > 0) doc.addPage();

    // Top Header Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 24, 'F');
    doc.setFillColor(5, 150, 105); // emerald-600
    doc.rect(0, 24, pageWidth, 2.5, 'F');

    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('PDF MASTER INDIA • OFFICIAL VERIFIED DIGITAL PUBLICATION', 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text(`${docDef.category}  |  Lifetime License Access Edition`, 14, 18);

    // Page Title
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(page.title, 14, 38);

    // Horizontal separator
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, 43, 196, 43);

    // Page Content Lines
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);

    let curY = 50;
    for (const line of page.content) {
      if (line === '') {
        curY += 4;
        continue;
      }
      if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || line.startsWith('TOPIC:') || line.startsWith('SITUATION') || line.startsWith('PRACTICAL') || line.startsWith('BUREAU') || line.startsWith('TITLE BLOCK')) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
      } else if (line.startsWith(' -') || line.startsWith('   *') || line.startsWith(' [x]')) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
      }

      const splitLines = doc.splitTextToSize(line, 182);
      doc.text(splitLines, 14, curY);
      curY += splitLines.length * 5.2 + 0.8;

      if (curY > pageHeight - 35) {
        break;
      }
    }

    // Bottom Verified License Box
    const footerY = pageHeight - 25;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, footerY - 4, 182, 18, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(5, 150, 105);
    doc.text('VERIFIED ORIGINAL DIGITAL COPY • LICENSED VIA ALDAHR.ONLINE / PDF MASTER INDIA', 18, footerY + 2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Official PDF Download • 24x7 WhatsApp Help: +91 70799 88808 • Page ${pIdx + 1} of ${docDef.pages.length}`, 18, footerY + 8);
  });

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}

// Generate each document
for (const item of docsToSeed) {
  const targetPath = path.join(uploadsDir, item.fileName);
  try {
    const buf = buildPdf(item);
    fs.writeFileSync(targetPath, buf);
    console.log(`✓ Seeded ${item.fileName} (${Math.round(buf.length / 1024)} KB) into ${uploadsDir}`);
  } catch (err) {
    console.error(`Failed to seed ${item.fileName}:`, err);
  }
}
