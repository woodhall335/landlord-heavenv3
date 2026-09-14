import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const repositoryRoot = path.resolve(__dirname, '../..');

function findSourceFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return findSourceFiles(absolutePath);
    }

    return /\.(?:ts|tsx)$/.test(entry.name) ? [absolutePath] : [];
  });
}

describe('Vercel Hobby function budget', () => {
  it('leaves Node App Router routes on the default runtime so Vercel can bundle them', () => {
    const appDirectory = path.join(repositoryRoot, 'src', 'app');
    const explicitlyConfiguredNodeRoutes = findSourceFiles(appDirectory)
      .filter((filePath) =>
        /export\s+const\s+runtime\s*=\s*['"]nodejs['"]/.test(
          fs.readFileSync(filePath, 'utf8'),
        ),
      )
      .map((filePath) => path.relative(repositoryRoot, filePath).replaceAll('\\', '/'));

    expect(explicitlyConfiguredNodeRoutes).toEqual([]);
  });

  it('does not turn static App Router pages into configured serverless functions', () => {
    const vercelConfig = JSON.parse(
      fs.readFileSync(path.join(repositoryRoot, 'vercel.json'), 'utf8'),
    ) as { functions?: Record<string, { maxDuration?: number }> };

    expect(vercelConfig.functions).toBeUndefined();
  });
});
