#!/usr/bin/env tsx
/**
 * CONVERT TEMPLATES TO PRINT DESIGN SYSTEM
 *
 * This script converts notice-only templates to use the centralized print.css
 * by replacing inline <style> blocks with {{{print_css}}}
 *
 * IMPORTANT: This only changes layout/styling - NO legal wording changes!
 */

import fs from 'fs/promises';
import path from 'path';

const TEMPLATES_TO_CONVERT = [
  'config/jurisdictions/uk/wales/templates/notice_only/rhw16_notice_termination_6_months/notice.hbs',
  'config/jurisdictions/uk/wales/templates/notice_only/rhw17_notice_termination_2_months/notice.hbs',
  'config/jurisdictions/uk/wales/templates/notice_only/rhw23_notice_before_possession_claim/notice.hbs',
  'config/jurisdictions/uk/scotland/templates/notice_only/notice_to_leave_prt_2017/notice.hbs',
];

async function convertTemplate(templatePath: string): Promise<void> {
  console.log(`📝 Converting: ${templatePath}`);

  const fullPath = path.join(process.cwd(), templatePath);
  let content = await fs.readFile(fullPath, 'utf-8');

  // Check if already converted
  if (content.includes('{{{print_css}}}')) {
    console.log(`   ✅ Already using print.css`);
    return;
  }

  // Replace inline <style> block with print.css injection
  const styleRegex = /<style>[\s\S]*?<\/style>/;

  if (!styleRegex.test(content)) {
    console.log(`   ⚠️  No <style> block found - skipping`);
    return;
  }

  content = content.replace(styleRegex, `<style>
    {{{print_css}}}
  </style>`);

  // Add comment in header about using Print Design System
  const importantComment = /IMPORTANT:/;
  if (importantComment.test(content)) {
    content = content.replace(
      /(IMPORTANT:[\s\S]*?)(--}})/,
      `$1  - Uses shared Print Design System from config/jurisdictions/_shared/print/\n$2`
    );
  }

  await fs.writeFile(fullPath, content, 'utf-8');
  console.log(`   ✅ Converted successfully`);
}

async function main(): Promise<void> {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║     CONVERT TEMPLATES TO PRINT DESIGN SYSTEM                  ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('');

  for (const templatePath of TEMPLATES_TO_CONVERT) {
    try {
      await convertTemplate(templatePath);
    } catch (error: any) {
      console.error(`❌ Error converting ${templatePath}:`, error.message);
    }
  }

  console.log('');
  console.log('✅ All templates processed!');
}

main().catch(console.error);
