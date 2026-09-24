const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').trim().replace(/\/+$/, '')

/** Adds the configured deployment prefix to an app-local URL. */
export function appPath(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  if (!basePath || normalizedPath === basePath || normalizedPath.startsWith(`${basePath}/`)) {
    return normalizedPath
  }

  return `${basePath}${normalizedPath}`
}
