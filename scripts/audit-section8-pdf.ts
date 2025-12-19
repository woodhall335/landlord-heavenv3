import fs from 'fs';
import pdf from 'pdf-parse';

const targetPath = process.argv[2] || '/mnt/data/ed3842d0-1960-461d-bd43-6962b9f633bf.pdf';

async function extractPdfText(filePath: string) {
  const buffer = fs.readFileSync(filePath);
  return pdf(buffer);
}

function printSection(lines: string[], matcher: (line: string) => boolean, context = 3, label?: string) {
  const matches: number[] = [];
  lines.forEach((line, idx) => {
    if (matcher(line)) {
      matches.push(idx);
    }
  });

  if (!matches.length) {
    console.log(label ? `No matches for ${label}` : 'No matches found');
    return;
  }

  matches.forEach(idx => {
    const start = Math.max(0, idx - context);
    const end = Math.min(lines.length, idx + context + 1);
    const snippet = lines.slice(start, end);
    if (label) {
      console.log(`\n=== ${label} @ line ${idx + 1} ===`);
    } else {
      console.log(`\n=== Match @ line ${idx + 1} ===`);
    }
    snippet.forEach(l => console.log(l));
  });
}

(async () => {
  console.log(`[audit] Reading PDF: ${targetPath}`);
  const data = await extractPdfText(targetPath);
  const lines = data.text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  printSection(
    lines,
    line => line.includes('3. Your landlord / licensor intends to seek possession on ground(s):'),
    4,
    'Section 3 Ground List'
  );

  printSection(
    lines,
    line => /Ground\s*[:\-]/i.test(line) || /Ground\s+[0-9]/i.test(line),
    2,
    'Ground lines'
  );

  printSection(
    lines,
    line => /Ground particulars/i.test(line),
    3,
    'Ground particulars blocks'
  );
})();
