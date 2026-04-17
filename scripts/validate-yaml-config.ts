import { readdirSync, readFileSync, statSync } from 'fs';
import path from 'path';
import yaml from 'js-yaml';

type ValidationError = {
  file: string;
  message: string;
  line?: number;
  column?: number;
};

function collectYamlFiles(rootDir: string): string[] {
  const entries = readdirSync(rootDir);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      files.push(...collectYamlFiles(fullPath));
      continue;
    }

    if (stats.isFile() && (entry.endsWith('.yaml') || entry.endsWith('.yml'))) {
      files.push(fullPath);
    }
  }

  return files;
}

function validateYamlFile(filePath: string): ValidationError | null {
  try {
    const source = readFileSync(filePath, 'utf8');
    yaml.load(source);
    return null;
  } catch (error) {
    const yamlError = error as Error & {
      mark?: { line?: number; column?: number };
      reason?: string;
    };

    return {
      file: path.relative(process.cwd(), filePath).replace(/\\/g, '/'),
      message: yamlError.reason || yamlError.message,
      line:
        typeof yamlError.mark?.line === 'number' ? yamlError.mark.line + 1 : undefined,
      column:
        typeof yamlError.mark?.column === 'number'
          ? yamlError.mark.column + 1
          : undefined,
    };
  }
}

function main() {
  const configRoot = path.join(process.cwd(), 'config');
  const yamlFiles = collectYamlFiles(configRoot);
  const errors = yamlFiles
    .map((filePath) => validateYamlFile(filePath))
    .filter((error): error is ValidationError => Boolean(error));

  if (errors.length > 0) {
    console.error(
      `YAML validation failed for ${errors.length} file${errors.length === 1 ? '' : 's'}:`
    );

    for (const error of errors) {
      const location =
        typeof error.line === 'number' && typeof error.column === 'number'
          ? `:${error.line}:${error.column}`
          : '';
      console.error(`- ${error.file}${location} -> ${error.message}`);
    }

    process.exit(1);
  }

  console.log(`Validated ${yamlFiles.length} YAML config files.`);
}

main();
