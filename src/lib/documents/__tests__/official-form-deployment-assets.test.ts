import { readFile } from 'fs/promises';
import path from 'path';
import { describe, expect, it } from 'vitest';

const REQUIRED_OFFICIAL_FORMS = [
  ['Form_3A.pdf'],
  ['Form_4A.pdf'],
  ['N1_1224.pdf'],
  ['N215.pdf'],
  ['n5-eng.pdf'],
  ['n5b-eng.pdf'],
  ['n119-eng.pdf'],
  ['n325-eng.pdf'],
  ['N325A.pdf'],
  ['N5_WALES_1222.pdf'],
  ['N5B_WALES_0323.pdf'],
  ['N119_WALES_1222.pdf'],
  ['scotland', 'notice_to_leave.pdf'],
  ['scotland', 'form_e_eviction.pdf'],
  ['scotland', 'form-3a.pdf'],
  ['scotland', 'simple_procedure_response_form.pdf'],
];

describe('official form deployment assets', () => {
  it('keeps every server-filled official PDF present in public/official-forms', async () => {
    for (const formPath of REQUIRED_OFFICIAL_FORMS) {
      const filePath = path.join(process.cwd(), 'public', 'official-forms', ...formPath);
      const bytes = await readFile(filePath);

      expect(bytes.byteLength, formPath.join('/')).toBeGreaterThan(1000);
    }
  });

  it('keeps official PDFs eligible for source control instead of ignoring them', async () => {
    const gitignore = await readFile(path.join(process.cwd(), '.gitignore'), 'utf8');

    expect(gitignore).toContain('!public/official-forms/*.pdf');
    expect(gitignore).toContain('!public/official-forms/scotland/notice_to_leave.pdf');
    expect(gitignore).toContain('!public/official-forms/scotland/form_e_eviction.pdf');
    expect(gitignore).toContain('!public/official-forms/scotland/form-3a.pdf');
    expect(gitignore).toContain('!public/official-forms/scotland/simple_procedure_response_form.pdf');
  });
});
