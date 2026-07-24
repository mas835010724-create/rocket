const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * Prepends the base path to the given asset path.
 * If the path already starts with the base path or is an absolute URL, it returns it as is.
 * @param path The relative path to the asset (e.g., "/icon/noData.svg")
 * @returns The resolved asset path (e.g., "/en/sub/icon/noData.svg")
 */
export function getAssetPath(path: string): string {
  if (!path) return "";
  if (
    path.startsWith("http") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  // Ensure we don't double the prefix if it's already there
  if (BASE_PATH && path.startsWith(BASE_PATH)) {
    return path;
  }

  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${BASE_PATH}${normalizedPath}`;
}
