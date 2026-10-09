// Generates crisp SVG Data URIs matching the covers in the screenshot
export function createBookCoverSvg(
  title: string,
  subtitle: string,
  bgGradient: [string, string],
  accentColor: string,
  badgeText: string = 'BESTSELLER',
  iconType: string = 'ai'
): string {
  const [c1, c2] = bgGradient;

  let iconSvg = '';
  if (iconType === 'ai') {
    iconSvg = `<circle cx="150" cy="190" r="45" fill="none" stroke="${accentColor}" stroke-width="4"/>
    <path d="M120 190 Q150 140 180 190 T120 190" fill="none" stroke="${accentColor}" stroke-width="3"/>
    <circle cx="150" cy="190" r="15" fill="${accentColor}"/>
    <circle cx="115" cy="160" r="6" fill="${accentColor}"/><circle cx="185" cy="160" r="6" fill="${accentColor}"/>
    <circle cx="150" cy="245" r="6" fill="${accentColor}"/>`;
  } else if (iconType === 'chat') {
    iconSvg = `<rect x="110" y="160" width="80" height="55" rx="12" fill="none" stroke="${accentColor}" stroke-width="4"/>
    <path d="M130 215 L120 230 L150 215 Z" fill="${accentColor}"/>
    <circle cx="135" cy="187" r="4" fill="${accentColor}"/><circle cx="150" cy="187" r="4" fill="${accentColor}"/><circle cx="165" cy="187" r="4" fill="${accentColor}"/>`;
  } else if (iconType === 'business') {
    iconSvg = `<rect x="110" y="165" width="80" height="55" rx="8" fill="none" stroke="${accentColor}" stroke-width="4"/>
    <path d="M130 165 V150 H170 V165" fill="none" stroke="${accentColor}" stroke-width="4"/>
    <line x1="110" y1="185" x2="190" y2="185" stroke="${accentColor}" stroke-width="3"/>
    <circle cx="150" cy="185" r="6" fill="${accentColor}"/>`;
  } else if (iconType === 'book') {
    iconSvg = `<path d="M110 160 C130 150 150 160 150 160 C150 160 170 150 190 160 V220 C170 210 150 220 150 220 C150 220 130 210 110 220 Z" fill="none" stroke="${accentColor}" stroke-width="4"/>
    <line x1="150" y1="160" x2="150" y2="220" stroke="${accentColor}" stroke-width="4"/>`;
  } else if (iconType === 'mosque') {
    iconSvg = `<path d="M150 145 C130 165 130 185 130 220 H170 C170 185 170 165 150 145 Z" fill="none" stroke="${accentColor}" stroke-width="4"/>
    <path d="M150 135 V145" stroke="${accentColor}" stroke-width="3"/>
    <circle cx="150" cy="132" r="4" fill="${accentColor}"/>
    <rect x="115" y="175" width="10" height="45" fill="${accentColor}"/><rect x="175" y="175" width="10" height="45" fill="${accentColor}"/>`;
  } else if (iconType === 'video') {
    iconSvg = `<rect x="110" y="160" width="80" height="55" rx="10" fill="none" stroke="${accentColor}" stroke-width="4"/>
    <polygon points="142,175 168,187 142,200" fill="${accentColor}"/>`;
  } else if (iconType === 'code') {
    iconSvg = `<path d="M130 170 L115 187 L130 205" fill="none" stroke="${accentColor}" stroke-width="4" stroke-linecap="round"/>
    <path d="M170 170 L185 187 L170 205" fill="none" stroke="${accentColor}" stroke-width="4" stroke-linecap="round"/>
    <line x1="156" y1="165" x2="144" y2="210" stroke="${accentColor}" stroke-width="4" stroke-linecap="round"/>`;
  } else {
    iconSvg = `<polygon points="150,150 162,175 190,178 170,197 175,225 150,211 125,225 130,197 110,178 138,175" fill="${accentColor}"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 420" width="300" height="420">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
      <pattern id="grid" width="20" height="20" patternUnits="userSpace">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="300" height="420" rx="16" fill="url(#bg)"/>
    <rect width="300" height="420" rx="16" fill="url(#grid)"/>

    <!-- Spine highlight & 3D book edge -->
    <rect x="0" y="0" width="14" height="420" rx="16" fill="rgba(255,255,255,0.15)"/>
    <line x1="14" y1="0" x2="14" y2="420" stroke="rgba(0,0,0,0.3)" stroke-width="2"/>

    <!-- Top Badge -->
    <rect x="25" y="22" width="95" height="22" rx="4" fill="#DC2626"/>
    <text x="72" y="37" fill="#FFFFFF" font-size="11" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle" letter-spacing="1">${badgeText}</text>

    <!-- PDF Icon Tag -->
    <g transform="translate(240, 20)">
      <rect width="36" height="42" rx="6" fill="#EF4444"/>
      <text x="18" y="26" fill="#FFFFFF" font-size="11" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">PDF</text>
    </g>

    <!-- Center Graphic -->
    <g>${iconSvg}</g>

    <!-- Title & Subtitle -->
    <foreignObject x="25" y="250" width="250" height="120">
      <div xmlns="http://www.w3.org/1999/xhtml" style="color: white; font-family: system-ui, -apple-system, sans-serif; text-align: center;">
        <div style="font-size: 20px; font-weight: 800; line-height: 1.2; text-shadow: 0 2px 8px rgba(0,0,0,0.6); margin-bottom: 6px;">
          ${title}
        </div>
        <div style="font-size: 11px; font-weight: 500; color: #E2E8F0; letter-spacing: 0.5px; opacity: 0.9;">
          ${subtitle}
        </div>
      </div>
    </foreignObject>

    <!-- Bottom Bar / Logo Stamp -->
    <rect x="25" y="375" width="250" height="24" rx="6" fill="rgba(0,0,0,0.3)"/>
    <text x="150" y="391" fill="#F8FAFC" font-size="10" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle" letter-spacing="1">
      PDF MASTER INDIA • 2026 EDITION
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function createSamplePageSvg(pageNum: number, title: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 420" width="300" height="420">
    <rect width="300" height="420" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
    <rect x="25" y="25" width="250" height="30" fill="#F8FAFC" rx="4"/>
    <text x="35" y="45" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#0F172A">${title} - Page ${pageNum}</text>
    <text x="255" y="45" font-family="system-ui, sans-serif" font-size="10" fill="#64748B">PDF Master</text>
    <line x1="25" y1="65" x2="275" y2="65" stroke="#E2E8F0" stroke-width="1"/>

    <!-- Paragraph lines -->
    <rect x="25" y="85" width="160" height="12" rx="3" fill="#0284C7"/>
    <rect x="25" y="110" width="250" height="8" rx="2" fill="#CBD5E1"/>
    <rect x="25" y="125" width="240" height="8" rx="2" fill="#E2E8F0"/>
    <rect x="25" y="140" width="210" height="8" rx="2" fill="#E2E8F0"/>

    <!-- Diagram / Infographic Mockup -->
    <rect x="25" y="165" width="250" height="110" rx="8" fill="#F1F5F9" stroke="#E2E8F0"/>
    <circle cx="80" cy="220" r="25" fill="#38BDF8" opacity="0.3"/>
    <circle cx="150" cy="220" r="25" fill="#F43F5E" opacity="0.3"/>
    <circle cx="220" cy="220" r="25" fill="#10B981" opacity="0.3"/>
    <text x="150" y="260" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#475569" text-anchor="middle">Step-by-Step Architecture &amp; Prompt Framework</text>

    <!-- More lines -->
    <rect x="25" y="295" width="250" height="8" rx="2" fill="#CBD5E1"/>
    <rect x="25" y="310" width="230" height="8" rx="2" fill="#E2E8F0"/>
    <rect x="25" y="325" width="245" height="8" rx="2" fill="#E2E8F0"/>
    <rect x="25" y="340" width="180" height="8" rx="2" fill="#E2E8F0"/>

    <!-- Footer -->
    <line x1="25" y1="375" x2="275" y2="375" stroke="#E2E8F0" stroke-width="1"/>
    <text x="150" y="395" font-family="system-ui, sans-serif" font-size="9" fill="#94A3B8" text-anchor="middle">Confidential &amp; Copyright © PDF Master India • All Rights Reserved</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
