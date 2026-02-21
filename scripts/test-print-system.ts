#!/usr/bin/env tsx
/**
 * TEST PRINT DESIGN SYSTEM
 *
 * Quick test to verify the print system loads and integrates correctly
 */

import { loadPrintCss, registerPrintPartials, compileTemplate } from '../src/lib/documents/generator';

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║         PRINT DESIGN SYSTEM TEST                              ║');
console.log('╚═══════════════════════════════════════════════════════════════╝');
console.log('');

// Test 1: Load print.css
console.log('🧪 Test 1: Loading print.css...');
try {
  const css = loadPrintCss();
  console.log(`   ✅ Loaded ${css.length} bytes of CSS`);

  // Verify key CSS rules are present
  const expectedRules = [
    '@page',
    'body {',
    'h1 {',
    '.info-box',
    '.field-value',
    '.ground-block',
    'page-break',
  ];

  let missing = 0;
  for (const rule of expectedRules) {
    if (!css.includes(rule)) {
      console.error(`   ❌ Missing CSS rule: ${rule}`);
      missing++;
    }
  }

  if (missing === 0) {
    console.log(`   ✅ All expected CSS rules found`);
  } else {
    console.error(`   ❌ ${missing} CSS rules missing`);
    process.exit(1);
  }
} catch (error: any) {
  console.error(`   ❌ Failed: ${error.message}`);
  process.exit(1);
}

// Test 2: Register partials
console.log('');
console.log('🧪 Test 2: Registering print partials...');
try {
  registerPrintPartials();
  console.log('   ✅ Partials registered successfully');
} catch (error: any) {
  console.error(`   ❌ Failed: ${error.message}`);
  process.exit(1);
}

// Test 3: Compile a simple template with print_css
console.log('');
console.log('🧪 Test 3: Compiling template with print_css...');
try {
  const testTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>{{{print_css}}}</style>
    </head>
    <body>
      <h1>{{title}}</h1>
      <div class="info-box">
        <p>{{content}}</p>
      </div>
    </body>
    </html>
  `;

  const html = compileTemplate(testTemplate, {
    title: 'Test Notice',
    content: 'This is a test of the print design system.',
  });

  // Verify print_css was injected
  if (html.includes('@page')) {
    console.log('   ✅ print_css injected successfully');
  } else {
    console.error('   ❌ print_css not injected into template');
    process.exit(1);
  }

  // Verify data was rendered
  if (html.includes('Test Notice') && html.includes('This is a test')) {
    console.log('   ✅ Template data rendered correctly');
  } else {
    console.error('   ❌ Template data not rendered');
    process.exit(1);
  }
} catch (error: any) {
  console.error(`   ❌ Failed: ${error.message}`);
  console.error(error.stack);
  process.exit(1);
}

console.log('');
console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║                    SUCCESS                                    ║');
console.log('╚═══════════════════════════════════════════════════════════════╝');
console.log('');
console.log('✅ Print Design System is working correctly!');
console.log('');
