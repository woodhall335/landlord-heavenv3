import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';

const APP_DIR_CANDIDATES = [
  path.join(process.cwd(), 'src', 'app'),
  path.join(process.cwd(), 'app'),
];

const isDynamicSegment = (segment) => /^\[.*\]$/.test(segment);
const isRouteGroup = (segment) => /^\(.*\)$/.test(segment);
const isParallelSegment = (segment) => segment.startsWith('@');

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    const absPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walk(absPath)));
      continue;
    }

    out.push(absPath);
  }

  return out;
}

export function routePathFromPageFile(appDir, absFilePath) {
  const rel = absFilePath.slice(appDir.length).split(path.sep).join('/');
  const segs = rel.split('/').filter(Boolean);

  if (segs.at(-1) !== 'page.tsx') {
    return null;
  }

  segs.pop();

  if (segs.some((segment) => isDynamicSegment(segment))) {
    return null;
  }

  const normalizedSegments = segs.filter((segment) => !isRouteGroup(segment) && !isParallelSegment(segment));

  return normalizedSegments.length ? `/${normalizedSegments.join('/')}` : '/';
}

export function resolveAppDir(appDir) {
  if (appDir) {
    return fsSync.existsSync(appDir) ? appDir : null;
  }

  return APP_DIR_CANDIDATES.find((candidate) => fsSync.existsSync(candidate)) ?? null;
}

export async function discoverStaticPageRoutes(appDir) {
  const resolvedAppDir = resolveAppDir(appDir);
  if (!resolvedAppDir) {
    return [];
  }

  const files = await walk(resolvedAppDir);
  const routes = new Set();

  for (const filePath of files) {
    if (!filePath.endsWith('page.tsx') || filePath.includes(`${path.sep}__tests__${path.sep}`)) {
      continue;
    }

    const routePath = routePathFromPageFile(resolvedAppDir, filePath);
    if (routePath) {
      routes.add(routePath);
    }
  }

  return [...routes].sort((a, b) => a.localeCompare(b));
}
