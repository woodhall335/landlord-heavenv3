import { discoverStaticPageRoutes as discoverStaticPageRoutesImpl, routePathFromPageFile as routePathFromPageFileImpl } from './static-route-inventory.shared.mjs';

export function routePathFromPageFile(appDir: string, absFilePath: string): string | null {
  return routePathFromPageFileImpl(appDir, absFilePath);
}

export async function discoverStaticPageRoutes(appDir?: string): Promise<string[]> {
  return discoverStaticPageRoutesImpl(appDir);
}
