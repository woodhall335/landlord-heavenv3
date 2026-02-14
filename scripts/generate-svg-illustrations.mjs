#!/usr/bin/env node
/**
 * SVG Illustration Generator for Blog Images
 * Creates branded purple SVG illustrations for all blog placeholder images
 *
 * Usage: node scripts/generate-svg-illustrations.mjs
 *
 * This generates clean, professional SVG illustrations matching the brand purple (#7C3AED)
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const POSTS_FILE = path.join(ROOT_DIR, 'src/lib/blog/posts.tsx');
const OUTPUT_DIR = path.join(ROOT_DIR, 'public/images/blog');

// Brand colors
const COLORS = {
  primary: '#7C3AED',      // Main purple
  primaryDark: '#6D28D9',  // Dark purple
  primaryLight: '#A78BFA', // Light purple
  lavender: '#F3F1FF',     // Background
  white: '#FFFFFF',
  gray: '#94A3B8',
};

// SVG Templates by category
const SVG_TEMPLATES = {
  // Legal documents
  'document': (title) => `
<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.lavender}"/>
      <stop offset="100%" style="stop-color:#E9E5FF"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#bgGrad)"/>

  <!-- Document stack -->
  <g transform="translate(250, 80)">
    <!-- Back document -->
    <rect x="30" y="30" width="250" height="320" rx="8" fill="white" stroke="${COLORS.gray}" stroke-width="1" opacity="0.5"/>
    <!-- Middle document -->
    <rect x="15" y="15" width="250" height="320" rx="8" fill="white" stroke="${COLORS.gray}" stroke-width="1" opacity="0.7"/>
    <!-- Front document -->
    <rect x="0" y="0" width="250" height="320" rx="8" fill="white" stroke="${COLORS.primary}" stroke-width="2"/>

    <!-- Document content -->
    <rect x="20" y="20" width="60" height="8" rx="4" fill="${COLORS.primary}"/>
    <rect x="20" y="40" width="210" height="6" rx="3" fill="${COLORS.gray}" opacity="0.3"/>
    <rect x="20" y="55" width="180" height="6" rx="3" fill="${COLORS.gray}" opacity="0.3"/>
    <rect x="20" y="70" width="200" height="6" rx="3" fill="${COLORS.gray}" opacity="0.3"/>

    <!-- Divider -->
    <line x1="20" y1="95" x2="230" y2="95" stroke="${COLORS.lavender}" stroke-width="2"/>

    <!-- More content -->
    <rect x="20" y="110" width="190" height="6" rx="3" fill="${COLORS.gray}" opacity="0.3"/>
    <rect x="20" y="125" width="210" height="6" rx="3" fill="${COLORS.gray}" opacity="0.3"/>
    <rect x="20" y="140" width="170" height="6" rx="3" fill="${COLORS.gray}" opacity="0.3"/>

    <!-- Checkbox items -->
    <rect x="20" y="170" width="16" height="16" rx="3" stroke="${COLORS.primary}" stroke-width="2" fill="none"/>
    <rect x="45" y="173" width="140" height="6" rx="3" fill="${COLORS.gray}" opacity="0.3"/>
    <rect x="20" y="195" width="16" height="16" rx="3" stroke="${COLORS.primary}" stroke-width="2" fill="${COLORS.primary}"/>
    <path d="M24 203 L28 207 L36 199" stroke="white" stroke-width="2" fill="none"/>
    <rect x="45" y="198" width="160" height="6" rx="3" fill="${COLORS.gray}" opacity="0.3"/>

    <!-- Signature area -->
    <rect x="20" y="260" width="100" height="40" rx="4" stroke="${COLORS.primary}" stroke-width="1" stroke-dasharray="4" fill="none"/>
    <path d="M40 285 Q60 270 80 285 Q100 300 120 280" stroke="${COLORS.primary}" stroke-width="2" fill="none" opacity="0.6"/>
  </g>

  <!-- Decorative elements -->
  <circle cx="650" cy="100" r="60" fill="${COLORS.primary}" opacity="0.1"/>
  <circle cx="100" cy="400" r="80" fill="${COLORS.primaryLight}" opacity="0.1"/>
</svg>`,

  // House/Property
  'house': (title) => `
<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.lavender}"/>
      <stop offset="100%" style="stop-color:#E9E5FF"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#bgGrad)"/>

  <!-- House -->
  <g transform="translate(250, 100)">
    <!-- Roof -->
    <path d="M-20 150 L150 30 L320 150" fill="none" stroke="${COLORS.primary}" stroke-width="8" stroke-linecap="round"/>
    <path d="M0 150 L150 50 L300 150" fill="${COLORS.primaryDark}"/>

    <!-- Chimney -->
    <rect x="220" y="60" width="40" height="70" fill="${COLORS.primary}"/>

    <!-- Main building -->
    <rect x="30" y="150" width="240" height="180" fill="white" stroke="${COLORS.primary}" stroke-width="3"/>

    <!-- Door -->
    <rect x="120" y="220" width="60" height="110" rx="5" fill="${COLORS.primary}"/>
    <circle cx="165" cy="275" r="5" fill="${COLORS.primaryLight}"/>

    <!-- Windows -->
    <rect x="55" y="180" width="50" height="50" rx="3" fill="${COLORS.lavender}" stroke="${COLORS.primary}" stroke-width="2"/>
    <line x1="80" y1="180" x2="80" y2="230" stroke="${COLORS.primary}" stroke-width="2"/>
    <line x1="55" y1="205" x2="105" y2="205" stroke="${COLORS.primary}" stroke-width="2"/>

    <rect x="195" y="180" width="50" height="50" rx="3" fill="${COLORS.lavender}" stroke="${COLORS.primary}" stroke-width="2"/>
    <line x1="220" y1="180" x2="220" y2="230" stroke="${COLORS.primary}" stroke-width="2"/>
    <line x1="195" y1="205" x2="245" y2="205" stroke="${COLORS.primary}" stroke-width="2"/>
  </g>

  <!-- Trees -->
  <g transform="translate(550, 200)">
    <rect x="20" y="100" width="20" height="60" fill="${COLORS.primaryDark}" opacity="0.7"/>
    <circle cx="30" cy="80" r="50" fill="${COLORS.primary}" opacity="0.3"/>
    <circle cx="15" cy="95" r="35" fill="${COLORS.primary}" opacity="0.4"/>
    <circle cx="45" cy="95" r="35" fill="${COLORS.primary}" opacity="0.4"/>
  </g>

  <!-- Ground -->
  <ellipse cx="400" cy="430" rx="350" ry="30" fill="${COLORS.primary}" opacity="0.1"/>
</svg>`,

  // Court/Legal
  'court': (title) => `
<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.lavender}"/>
      <stop offset="100%" style="stop-color:#E9E5FF"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#bgGrad)"/>

  <!-- Courthouse building -->
  <g transform="translate(200, 80)">
    <!-- Pediment (triangular top) -->
    <path d="M0 130 L200 30 L400 130" fill="${COLORS.primaryDark}"/>

    <!-- Main building -->
    <rect x="20" y="130" width="360" height="250" fill="white" stroke="${COLORS.primary}" stroke-width="3"/>

    <!-- Columns -->
    <rect x="50" y="140" width="30" height="230" fill="${COLORS.lavender}" stroke="${COLORS.primary}" stroke-width="2"/>
    <rect x="120" y="140" width="30" height="230" fill="${COLORS.lavender}" stroke="${COLORS.primary}" stroke-width="2"/>
    <rect x="250" y="140" width="30" height="230" fill="${COLORS.lavender}" stroke="${COLORS.primary}" stroke-width="2"/>
    <rect x="320" y="140" width="30" height="230" fill="${COLORS.lavender}" stroke="${COLORS.primary}" stroke-width="2"/>

    <!-- Door -->
    <rect x="165" y="250" width="70" height="120" rx="35" fill="${COLORS.primary}"/>

    <!-- Steps -->
    <rect x="100" y="380" width="200" height="15" fill="${COLORS.lavender}" stroke="${COLORS.primary}" stroke-width="1"/>
    <rect x="80" y="395" width="240" height="15" fill="${COLORS.lavender}" stroke="${COLORS.primary}" stroke-width="1"/>
  </g>

  <!-- Scales of justice icon -->
  <g transform="translate(350, 25)">
    <circle cx="50" cy="25" r="20" fill="${COLORS.primary}" opacity="0.2"/>
    <line x1="50" y1="25" x2="50" y2="65" stroke="${COLORS.primary}" stroke-width="3"/>
    <line x1="20" y1="45" x2="80" y2="45" stroke="${COLORS.primary}" stroke-width="3"/>
    <path d="M20 50 L15 70 L40 70 L35 50" fill="${COLORS.primaryLight}" stroke="${COLORS.primary}" stroke-width="2"/>
    <path d="M80 50 L75 70 L100 70 L95 50" fill="${COLORS.primaryLight}" stroke="${COLORS.primary}" stroke-width="2"/>
  </g>
</svg>`,

  // Money/Finance
  'money': (title) => `
<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.lavender}"/>
      <stop offset="100%" style="stop-color:#E9E5FF"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#bgGrad)"/>

  <!-- Money/coins stack -->
  <g transform="translate(300, 150)">
    <!-- Coin stack 1 -->
    <ellipse cx="0" cy="200" rx="60" ry="15" fill="${COLORS.primaryDark}"/>
    <rect x="-60" y="160" width="120" height="40" fill="${COLORS.primary}"/>
    <ellipse cx="0" cy="160" rx="60" ry="15" fill="${COLORS.primaryLight}"/>
    <text x="0" y="185" text-anchor="middle" fill="white" font-size="24" font-weight="bold">£</text>

    <!-- Coin stack 2 -->
    <ellipse cx="100" cy="200" rx="60" ry="15" fill="${COLORS.primaryDark}"/>
    <rect x="40" y="130" width="120" height="70" fill="${COLORS.primary}"/>
    <ellipse cx="100" cy="130" rx="60" ry="15" fill="${COLORS.primaryLight}"/>
    <text x="100" y="165" text-anchor="middle" fill="white" font-size="24" font-weight="bold">£</text>

    <!-- Coin stack 3 -->
    <ellipse cx="200" cy="200" rx="60" ry="15" fill="${COLORS.primaryDark}"/>
    <rect x="140" y="100" width="120" height="100" fill="${COLORS.primary}"/>
    <ellipse cx="200" cy="100" rx="60" ry="15" fill="${COLORS.primaryLight}"/>
    <text x="200" y="145" text-anchor="middle" fill="white" font-size="24" font-weight="bold">£</text>
  </g>

  <!-- Rising arrow -->
  <g transform="translate(550, 120)">
    <line x1="0" y1="150" x2="120" y2="30" stroke="${COLORS.primary}" stroke-width="6" stroke-linecap="round"/>
    <polygon points="120,30 90,40 110,60" fill="${COLORS.primary}"/>
  </g>

  <!-- Chart bars in background -->
  <g transform="translate(100, 250)" opacity="0.3">
    <rect x="0" y="80" width="40" height="100" rx="5" fill="${COLORS.primary}"/>
    <rect x="60" y="50" width="40" height="130" rx="5" fill="${COLORS.primary}"/>
    <rect x="120" y="100" width="40" height="80" rx="5" fill="${COLORS.primary}"/>
  </g>
</svg>`,

  // Safety/Compliance
  'safety': (title) => `
<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.lavender}"/>
      <stop offset="100%" style="stop-color:#E9E5FF"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#bgGrad)"/>

  <!-- Shield -->
  <g transform="translate(300, 80)">
    <path d="M100 0 L200 30 L200 150 C200 220 100 280 100 280 C100 280 0 220 0 150 L0 30 Z"
          fill="white" stroke="${COLORS.primary}" stroke-width="4"/>
    <path d="M100 20 L180 45 L180 145 C180 200 100 250 100 250 C100 250 20 200 20 145 L20 45 Z"
          fill="${COLORS.lavender}"/>

    <!-- Checkmark -->
    <path d="M50 130 L85 165 L150 90" fill="none" stroke="${COLORS.primary}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- Certificate badge -->
  <g transform="translate(520, 200)">
    <circle cx="60" cy="60" r="50" fill="${COLORS.primary}" opacity="0.2"/>
    <circle cx="60" cy="60" r="35" fill="white" stroke="${COLORS.primary}" stroke-width="3"/>
    <text x="60" y="68" text-anchor="middle" fill="${COLORS.primary}" font-size="24" font-weight="bold">✓</text>
  </g>

  <!-- Decorative elements -->
  <circle cx="150" cy="400" r="50" fill="${COLORS.primary}" opacity="0.1"/>
  <circle cx="700" cy="100" r="70" fill="${COLORS.primaryLight}" opacity="0.15"/>
</svg>`,

  // Timeline/Process
  'timeline': (title) => `
<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.lavender}"/>
      <stop offset="100%" style="stop-color:#E9E5FF"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#bgGrad)"/>

  <!-- Timeline line -->
  <line x1="100" y1="250" x2="700" y2="250" stroke="${COLORS.primary}" stroke-width="4" stroke-linecap="round"/>

  <!-- Timeline points -->
  <g>
    <!-- Point 1 -->
    <circle cx="150" cy="250" r="20" fill="white" stroke="${COLORS.primary}" stroke-width="4"/>
    <circle cx="150" cy="250" r="10" fill="${COLORS.primary}"/>
    <rect x="115" y="180" width="70" height="50" rx="8" fill="white" stroke="${COLORS.primary}" stroke-width="2"/>
    <rect x="125" y="195" width="50" height="6" rx="3" fill="${COLORS.gray}" opacity="0.4"/>
    <rect x="125" y="208" width="35" height="6" rx="3" fill="${COLORS.gray}" opacity="0.4"/>

    <!-- Point 2 -->
    <circle cx="325" cy="250" r="20" fill="white" stroke="${COLORS.primary}" stroke-width="4"/>
    <circle cx="325" cy="250" r="10" fill="${COLORS.primary}"/>
    <rect x="290" y="280" width="70" height="50" rx="8" fill="white" stroke="${COLORS.primary}" stroke-width="2"/>
    <rect x="300" y="295" width="50" height="6" rx="3" fill="${COLORS.gray}" opacity="0.4"/>
    <rect x="300" y="308" width="35" height="6" rx="3" fill="${COLORS.gray}" opacity="0.4"/>

    <!-- Point 3 -->
    <circle cx="500" cy="250" r="20" fill="white" stroke="${COLORS.primary}" stroke-width="4"/>
    <circle cx="500" cy="250" r="10" fill="${COLORS.primary}"/>
    <rect x="465" y="180" width="70" height="50" rx="8" fill="white" stroke="${COLORS.primary}" stroke-width="2"/>
    <rect x="475" y="195" width="50" height="6" rx="3" fill="${COLORS.gray}" opacity="0.4"/>
    <rect x="475" y="208" width="35" height="6" rx="3" fill="${COLORS.gray}" opacity="0.4"/>

    <!-- Point 4 (current/highlight) -->
    <circle cx="650" cy="250" r="25" fill="${COLORS.primary}"/>
    <path d="M640 250 L648 258 L665 241" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/>
    <rect x="615" y="280" width="70" height="50" rx="8" fill="${COLORS.primary}"/>
    <rect x="625" y="295" width="50" height="6" rx="3" fill="white" opacity="0.6"/>
    <rect x="625" y="308" width="35" height="6" rx="3" fill="white" opacity="0.6"/>
  </g>
</svg>`,

  // Checklist
  'checklist': (title) => `
<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.lavender}"/>
      <stop offset="100%" style="stop-color:#E9E5FF"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#bgGrad)"/>

  <!-- Clipboard -->
  <g transform="translate(250, 50)">
    <!-- Clipboard board -->
    <rect x="0" y="30" width="300" height="380" rx="15" fill="white" stroke="${COLORS.primary}" stroke-width="3"/>

    <!-- Clip -->
    <rect x="100" y="10" width="100" height="40" rx="5" fill="${COLORS.primary}"/>
    <rect x="120" y="20" width="60" height="25" rx="5" fill="${COLORS.primaryDark}"/>

    <!-- Checklist items -->
    <!-- Item 1 - checked -->
    <rect x="30" y="80" width="30" height="30" rx="6" fill="${COLORS.primary}"/>
    <path d="M38 95 L45 102 L58 88" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/>
    <rect x="80" y="88" width="180" height="10" rx="5" fill="${COLORS.gray}" opacity="0.3"/>

    <!-- Item 2 - checked -->
    <rect x="30" y="140" width="30" height="30" rx="6" fill="${COLORS.primary}"/>
    <path d="M38 155 L45 162 L58 148" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/>
    <rect x="80" y="148" width="160" height="10" rx="5" fill="${COLORS.gray}" opacity="0.3"/>

    <!-- Item 3 - checked -->
    <rect x="30" y="200" width="30" height="30" rx="6" fill="${COLORS.primary}"/>
    <path d="M38 215 L45 222 L58 208" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/>
    <rect x="80" y="208" width="190" height="10" rx="5" fill="${COLORS.gray}" opacity="0.3"/>

    <!-- Item 4 - unchecked -->
    <rect x="30" y="260" width="30" height="30" rx="6" fill="none" stroke="${COLORS.primary}" stroke-width="2"/>
    <rect x="80" y="268" width="140" height="10" rx="5" fill="${COLORS.gray}" opacity="0.3"/>

    <!-- Item 5 - unchecked -->
    <rect x="30" y="320" width="30" height="30" rx="6" fill="none" stroke="${COLORS.primary}" stroke-width="2"/>
    <rect x="80" y="328" width="170" height="10" rx="5" fill="${COLORS.gray}" opacity="0.3"/>
  </g>

  <!-- Pencil decoration -->
  <g transform="translate(580, 200) rotate(30)">
    <rect x="0" y="0" width="15" height="100" fill="${COLORS.primaryLight}"/>
    <polygon points="0,100 7.5,130 15,100" fill="${COLORS.primaryDark}"/>
    <rect x="0" y="0" width="15" height="15" fill="${COLORS.primaryDark}"/>
  </g>
</svg>`,

  // HMO/Multi-occupancy
  'hmo': (title) => `
<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.lavender}"/>
      <stop offset="100%" style="stop-color:#E9E5FF"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#bgGrad)"/>

  <!-- Building -->
  <g transform="translate(250, 60)">
    <!-- Main building -->
    <rect x="0" y="50" width="300" height="350" fill="white" stroke="${COLORS.primary}" stroke-width="3"/>

    <!-- Roof -->
    <rect x="-10" y="35" width="320" height="25" fill="${COLORS.primaryDark}"/>

    <!-- Windows - Row 1 -->
    <rect x="30" y="80" width="50" height="60" rx="3" fill="${COLORS.lavender}" stroke="${COLORS.primary}" stroke-width="2"/>
    <rect x="125" y="80" width="50" height="60" rx="3" fill="${COLORS.lavender}" stroke="${COLORS.primary}" stroke-width="2"/>
    <rect x="220" y="80" width="50" height="60" rx="3" fill="${COLORS.lavender}" stroke="${COLORS.primary}" stroke-width="2"/>

    <!-- Windows - Row 2 -->
    <rect x="30" y="170" width="50" height="60" rx="3" fill="${COLORS.lavender}" stroke="${COLORS.primary}" stroke-width="2"/>
    <rect x="125" y="170" width="50" height="60" rx="3" fill="${COLORS.lavender}" stroke="${COLORS.primary}" stroke-width="2"/>
    <rect x="220" y="170" width="50" height="60" rx="3" fill="${COLORS.lavender}" stroke="${COLORS.primary}" stroke-width="2"/>

    <!-- Windows - Row 3 -->
    <rect x="30" y="260" width="50" height="60" rx="3" fill="${COLORS.lavender}" stroke="${COLORS.primary}" stroke-width="2"/>
    <rect x="220" y="260" width="50" height="60" rx="3" fill="${COLORS.lavender}" stroke="${COLORS.primary}" stroke-width="2"/>

    <!-- Door -->
    <rect x="120" y="310" width="60" height="90" rx="5" fill="${COLORS.primary}"/>
    <circle cx="165" cy="360" r="5" fill="${COLORS.primaryLight}"/>

    <!-- People icons -->
    <g transform="translate(40, 100)">
      <circle cx="10" cy="-5" r="6" fill="${COLORS.primary}" opacity="0.7"/>
      <ellipse cx="10" cy="10" rx="8" ry="5" fill="${COLORS.primary}" opacity="0.7"/>
    </g>
    <g transform="translate(135, 100)">
      <circle cx="10" cy="-5" r="6" fill="${COLORS.primary}" opacity="0.7"/>
      <ellipse cx="10" cy="10" rx="8" ry="5" fill="${COLORS.primary}" opacity="0.7"/>
    </g>
    <g transform="translate(230, 100)">
      <circle cx="10" cy="-5" r="6" fill="${COLORS.primary}" opacity="0.7"/>
      <ellipse cx="10" cy="10" rx="8" ry="5" fill="${COLORS.primary}" opacity="0.7"/>
    </g>
  </g>
</svg>`,

  // Scotland theme
  'scotland': (title) => `
<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.lavender}"/>
      <stop offset="100%" style="stop-color:#E9E5FF"/>
    </linearGradient>
    <pattern id="tartan" patternUnits="userSpaceOnUse" width="40" height="40">
      <rect width="40" height="40" fill="${COLORS.primaryLight}"/>
      <rect width="20" height="40" fill="${COLORS.primary}" opacity="0.3"/>
      <rect width="40" height="20" fill="${COLORS.primary}" opacity="0.3"/>
      <rect width="5" height="40" x="17.5" fill="${COLORS.primaryDark}" opacity="0.4"/>
      <rect width="40" height="5" y="17.5" fill="${COLORS.primaryDark}" opacity="0.4"/>
    </pattern>
  </defs>
  <rect width="800" height="500" fill="url(#bgGrad)"/>

  <!-- Scotland outline (simplified) -->
  <g transform="translate(280, 80)">
    <path d="M100 0 C120 20 140 10 160 30 C180 50 200 40 220 60 L240 100 C220 120 230 140 210 160
             L180 180 C160 200 170 220 150 240 L120 260 C100 280 80 270 60 290 L40 320
             C20 340 30 360 10 380 L0 350 C20 330 10 310 30 290 L50 250 C70 230 60 210 80 190
             L60 160 C40 140 50 120 30 100 L50 60 C70 40 80 50 100 30 Z"
          fill="url(#tartan)" stroke="${COLORS.primary}" stroke-width="3"/>

    <!-- Castle icon -->
    <g transform="translate(80, 100)">
      <rect x="0" y="40" width="80" height="60" fill="white" stroke="${COLORS.primary}" stroke-width="2"/>
      <rect x="0" y="30" width="20" height="10" fill="${COLORS.primaryDark}"/>
      <rect x="30" y="30" width="20" height="10" fill="${COLORS.primaryDark}"/>
      <rect x="60" y="30" width="20" height="10" fill="${COLORS.primaryDark}"/>
      <rect x="30" y="65" width="20" height="35" fill="${COLORS.primary}"/>
    </g>
  </g>

  <!-- Scottish legal document -->
  <g transform="translate(500, 150)">
    <rect x="0" y="0" width="180" height="220" rx="8" fill="white" stroke="${COLORS.primary}" stroke-width="2"/>
    <rect x="15" y="20" width="50" height="6" rx="3" fill="${COLORS.primary}"/>
    <rect x="15" y="40" width="150" height="5" rx="2" fill="${COLORS.gray}" opacity="0.3"/>
    <rect x="15" y="55" width="130" height="5" rx="2" fill="${COLORS.gray}" opacity="0.3"/>
    <rect x="15" y="70" width="145" height="5" rx="2" fill="${COLORS.gray}" opacity="0.3"/>
    <rect x="15" y="100" width="150" height="5" rx="2" fill="${COLORS.gray}" opacity="0.3"/>
    <rect x="15" y="115" width="120" height="5" rx="2" fill="${COLORS.gray}" opacity="0.3"/>
    <rect x="15" y="160" width="80" height="40" rx="5" stroke="${COLORS.primary}" stroke-width="1" fill="none"/>
  </g>
</svg>`,

  // Wales theme
  'wales': (title) => `
<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.lavender}"/>
      <stop offset="100%" style="stop-color:#E9E5FF"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#bgGrad)"/>

  <!-- Wales outline (simplified) -->
  <g transform="translate(280, 60)">
    <path d="M80 0 L120 30 L150 20 L180 50 L200 80 L180 130 L200 180 L180 230 L160 280
             L120 320 L80 350 L40 320 L20 270 L40 220 L20 170 L40 120 L20 70 L40 40 Z"
          fill="${COLORS.lavender}" stroke="${COLORS.primary}" stroke-width="3"/>

    <!-- Dragon silhouette (simplified) -->
    <g transform="translate(50, 100)">
      <path d="M0 80 C20 60 40 70 60 50 L80 60 C90 40 100 50 110 30 L100 50 L120 60 L100 70
               C80 80 60 75 40 90 L60 100 C40 110 20 100 0 120 L20 100 C10 90 5 85 0 80 Z"
            fill="${COLORS.primary}" opacity="0.3"/>
    </g>
  </g>

  <!-- Welsh legal document -->
  <g transform="translate(480, 100)">
    <rect x="0" y="0" width="200" height="280" rx="10" fill="white" stroke="${COLORS.primary}" stroke-width="2"/>

    <!-- Header with dragon accent -->
    <rect x="0" y="0" width="200" height="50" rx="10" fill="${COLORS.primary}" opacity="0.1"/>
    <rect x="15" y="20" width="80" height="8" rx="4" fill="${COLORS.primary}"/>

    <!-- Content lines -->
    <rect x="15" y="70" width="170" height="6" rx="3" fill="${COLORS.gray}" opacity="0.3"/>
    <rect x="15" y="90" width="150" height="6" rx="3" fill="${COLORS.gray}" opacity="0.3"/>
    <rect x="15" y="110" width="160" height="6" rx="3" fill="${COLORS.gray}" opacity="0.3"/>

    <rect x="15" y="145" width="170" height="6" rx="3" fill="${COLORS.gray}" opacity="0.3"/>
    <rect x="15" y="165" width="140" height="6" rx="3" fill="${COLORS.gray}" opacity="0.3"/>

    <!-- Signature area -->
    <rect x="15" y="210" width="100" height="50" rx="5" stroke="${COLORS.primary}" stroke-width="1" stroke-dasharray="4" fill="none"/>
  </g>

  <!-- Celtic knot decoration -->
  <circle cx="150" cy="400" r="40" fill="none" stroke="${COLORS.primary}" stroke-width="3" opacity="0.3"/>
  <circle cx="150" cy="400" r="25" fill="none" stroke="${COLORS.primary}" stroke-width="3" opacity="0.3"/>
</svg>`,

  // Tenant/People
  'tenant': (title) => `
<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.lavender}"/>
      <stop offset="100%" style="stop-color:#E9E5FF"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#bgGrad)"/>

  <!-- Person 1 (landlord) -->
  <g transform="translate(250, 120)">
    <circle cx="60" cy="50" r="45" fill="${COLORS.primaryLight}"/>
    <circle cx="60" cy="50" r="40" fill="white"/>
    <circle cx="60" cy="45" r="20" fill="${COLORS.primary}"/>
    <ellipse cx="60" cy="85" rx="30" ry="15" fill="${COLORS.primary}"/>
    <rect x="20" y="100" width="80" height="120" rx="10" fill="${COLORS.primary}"/>
  </g>

  <!-- Handshake in middle -->
  <g transform="translate(350, 200)">
    <circle cx="50" cy="50" r="60" fill="white" stroke="${COLORS.primary}" stroke-width="3"/>
    <path d="M20 50 L40 50 L50 40 L60 50 L80 50" stroke="${COLORS.primary}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M40 50 L40 70 M60 50 L60 70" stroke="${COLORS.primary}" stroke-width="4" stroke-linecap="round"/>
  </g>

  <!-- Person 2 (tenant) -->
  <g transform="translate(450, 120)">
    <circle cx="60" cy="50" r="45" fill="${COLORS.primaryLight}"/>
    <circle cx="60" cy="50" r="40" fill="white"/>
    <circle cx="60" cy="45" r="20" fill="${COLORS.primaryDark}"/>
    <ellipse cx="60" cy="85" rx="30" ry="15" fill="${COLORS.primaryDark}"/>
    <rect x="20" y="100" width="80" height="120" rx="10" fill="${COLORS.primaryDark}"/>
  </g>

  <!-- Keys -->
  <g transform="translate(380, 330)">
    <circle cx="20" cy="20" r="15" fill="none" stroke="${COLORS.primary}" stroke-width="3"/>
    <rect x="30" y="15" width="40" height="10" rx="3" fill="${COLORS.primary}"/>
    <rect x="55" y="25" width="10" height="15" rx="2" fill="${COLORS.primary}"/>
    <rect x="65" y="25" width="10" height="10" rx="2" fill="${COLORS.primary}"/>
  </g>
</svg>`,

  // Energy/EPC
  'energy': (title) => `
<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.lavender}"/>
      <stop offset="100%" style="stop-color:#E9E5FF"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#bgGrad)"/>

  <!-- EPC Rating Scale -->
  <g transform="translate(250, 60)">
    <!-- Rating bars -->
    <g>
      <rect x="0" y="0" width="180" height="35" rx="5" fill="#1B8720"/>
      <text x="15" y="25" fill="white" font-weight="bold" font-size="18">A</text>
      <text x="140" y="25" fill="white" font-size="14">1-20</text>
    </g>
    <g>
      <rect x="20" y="45" width="180" height="35" rx="5" fill="#3B9B1B"/>
      <text x="35" y="70" fill="white" font-weight="bold" font-size="18">B</text>
      <text x="160" y="70" fill="white" font-size="14">21-38</text>
    </g>
    <g>
      <rect x="40" y="90" width="180" height="35" rx="5" fill="#88B520"/>
      <text x="55" y="115" fill="white" font-weight="bold" font-size="18">C</text>
      <text x="180" y="115" fill="white" font-size="14">39-54</text>
    </g>
    <g>
      <rect x="60" y="135" width="180" height="35" rx="5" fill="${COLORS.primary}"/>
      <text x="75" y="160" fill="white" font-weight="bold" font-size="18">D</text>
      <text x="200" y="160" fill="white" font-size="14">55-68</text>
      <!-- Arrow indicator -->
      <polygon points="250,152 280,152 280,145 300,155 280,165 280,158 250,158" fill="${COLORS.primaryDark}"/>
    </g>
    <g>
      <rect x="80" y="180" width="180" height="35" rx="5" fill="#F5A623"/>
      <text x="95" y="205" fill="white" font-weight="bold" font-size="18">E</text>
      <text x="220" y="205" fill="white" font-size="14">69-80</text>
    </g>
    <g>
      <rect x="100" y="225" width="180" height="35" rx="5" fill="#E6781E"/>
      <text x="115" y="250" fill="white" font-weight="bold" font-size="18">F</text>
      <text x="240" y="250" fill="white" font-size="14">81-91</text>
    </g>
    <g>
      <rect x="120" y="270" width="180" height="35" rx="5" fill="#D0021B"/>
      <text x="135" y="295" fill="white" font-weight="bold" font-size="18">G</text>
      <text x="260" y="295" fill="white" font-size="14">92+</text>
    </g>
  </g>

  <!-- House icon -->
  <g transform="translate(550, 150)">
    <path d="M80 0 L160 60 L160 150 L0 150 L0 60 Z" fill="white" stroke="${COLORS.primary}" stroke-width="3"/>
    <rect x="55" y="90" width="50" height="60" rx="3" fill="${COLORS.primary}"/>
  </g>
</svg>`,

  // Default/Generic
  'default': (title) => `
<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.lavender}"/>
      <stop offset="100%" style="stop-color:#E9E5FF"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#bgGrad)"/>

  <!-- Abstract geometric shapes -->
  <circle cx="400" cy="250" r="120" fill="white" stroke="${COLORS.primary}" stroke-width="4"/>
  <circle cx="400" cy="250" r="80" fill="${COLORS.lavender}" stroke="${COLORS.primary}" stroke-width="2"/>
  <circle cx="400" cy="250" r="40" fill="${COLORS.primary}"/>

  <!-- Decorative elements -->
  <circle cx="180" cy="150" r="60" fill="${COLORS.primary}" opacity="0.15"/>
  <circle cx="620" cy="350" r="80" fill="${COLORS.primaryLight}" opacity="0.2"/>
  <circle cx="650" cy="100" r="40" fill="${COLORS.primary}" opacity="0.1"/>
  <circle cx="150" cy="380" r="50" fill="${COLORS.primaryDark}" opacity="0.1"/>

  <!-- Abstract lines -->
  <line x1="250" y1="200" x2="300" y2="150" stroke="${COLORS.primary}" stroke-width="3" opacity="0.3"/>
  <line x1="500" y1="300" x2="550" y2="350" stroke="${COLORS.primary}" stroke-width="3" opacity="0.3"/>
</svg>`
};

/**
 * Determine which template to use based on image name
 */
function getTemplate(name) {
  if (name.includes('scotland') || name.includes('prt') || name.includes('sheriff') || name.includes('ftt')) {
    return 'scotland';
  }
  if (name.includes('wales') || name.includes('rsw') || name.includes('contract-holder')) {
    return 'wales';
  }
  if (name.includes('section-21') || name.includes('s21') || name.includes('section-8') || name.includes('s8') ||
      name.includes('ground-') || name.includes('notice') || name.includes('form') || name.includes('n5') ||
      name.includes('n119') || name.includes('particulars') || name.includes('document')) {
    return 'document';
  }
  if (name.includes('court') || name.includes('hearing') || name.includes('tribunal') || name.includes('possession')) {
    return 'court';
  }
  if (name.includes('house') || name.includes('property') || name.includes('building') || name.includes('home') ||
      name.includes('holiday') || name.includes('student') || name.includes('corporate')) {
    return 'house';
  }
  if (name.includes('hmo') || name.includes('multiple-occupation') || name.includes('licensing')) {
    return 'hmo';
  }
  if (name.includes('rent') || name.includes('arrears') || name.includes('money') || name.includes('deposit') ||
      name.includes('payment') || name.includes('tax') || name.includes('cost') || name.includes('mcol')) {
    return 'money';
  }
  if (name.includes('safety') || name.includes('gas') || name.includes('electrical') || name.includes('eicr') ||
      name.includes('alarm') || name.includes('smoke') || name.includes('compliance') || name.includes('certificate')) {
    return 'safety';
  }
  if (name.includes('tenant') || name.includes('landlord') || name.includes('handover') || name.includes('move') ||
      name.includes('referencing') || name.includes('guarantor')) {
    return 'tenant';
  }
  if (name.includes('epc') || name.includes('energy') || name.includes('mees')) {
    return 'energy';
  }
  if (name.includes('timeline') || name.includes('process') || name.includes('overview') || name.includes('flowchart')) {
    return 'timeline';
  }
  if (name.includes('checklist') || name.includes('inspection') || name.includes('inventory')) {
    return 'checklist';
  }
  return 'default';
}

/**
 * Extract placeholders from posts.tsx
 */
async function extractPlaceholders() {
  const content = await fs.readFile(POSTS_FILE, 'utf-8');
  const placeholders = new Set();

  const regex = /placeholder-([^'"\.]+)\.svg/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    placeholders.add(match[1]);
  }

  return Array.from(placeholders);
}

/**
 * Generate SVG and save to file
 */
async function generateSVG(name) {
  const templateKey = getTemplate(name);
  const template = SVG_TEMPLATES[templateKey];
  const svgContent = template(name);

  const outputPath = path.join(OUTPUT_DIR, `${name}.svg`);
  await fs.writeFile(outputPath, svgContent.trim());

  return outputPath;
}

/**
 * Update posts.tsx to use generated SVGs (change from placeholder-X.svg to X.svg)
 */
async function updatePostsFile(names) {
  let content = await fs.readFile(POSTS_FILE, 'utf-8');
  let updateCount = 0;

  for (const name of names) {
    const oldPath = `/images/blog/placeholder-${name}.svg`;
    const newPath = `/images/blog/${name}.svg`;

    const newContent = content.replace(new RegExp(escapeRegex(oldPath), 'g'), newPath);
    if (newContent !== content) {
      updateCount++;
      content = newContent;
    }
  }

  if (updateCount > 0) {
    await fs.writeFile(POSTS_FILE, content);
    console.log(`\n📄 Updated ${updateCount} image references in posts.tsx`);
  }

  return updateCount;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Main execution
 */
async function main() {
  console.log('🎨 SVG Illustration Generator for Blog');
  console.log('======================================');
  console.log(`Brand color: ${COLORS.primary}`);
  console.log(`Output directory: ${OUTPUT_DIR}\n`);

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Extract all placeholder names
  console.log('📋 Extracting placeholders from posts.tsx...');
  const placeholders = await extractPlaceholders();
  console.log(`   Found ${placeholders.length} unique placeholders\n`);

  // Generate SVGs
  console.log('🖼️  Generating SVG illustrations...');
  const generated = [];

  for (let i = 0; i < placeholders.length; i++) {
    const name = placeholders[i];
    const templateKey = getTemplate(name);

    try {
      const outputPath = await generateSVG(name);
      generated.push(name);

      if ((i + 1) % 20 === 0 || i === placeholders.length - 1) {
        console.log(`   Progress: ${i + 1}/${placeholders.length} (${templateKey})`);
      }
    } catch (error) {
      console.error(`   ❌ Error generating ${name}: ${error.message}`);
    }
  }

  console.log(`\n✅ Generated ${generated.length} SVG illustrations`);

  // Update posts.tsx
  await updatePostsFile(generated);

  // Summary
  console.log('\n📊 Summary by template:');
  const templateCounts = {};
  for (const name of generated) {
    const template = getTemplate(name);
    templateCounts[template] = (templateCounts[template] || 0) + 1;
  }

  Object.entries(templateCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([template, count]) => {
      console.log(`   ${template}: ${count} images`);
    });

  console.log('\n✅ Done! SVG illustrations generated successfully.');
}

main().catch(console.error);
