import { useRef, useEffect } from 'react'

/**
 * Tracks URL.createObjectURL() lifetimes for a component and revokes
 * them on unmount, preventing blob-memory leaks.
 */
export function useObjectUrls() {
  const urls = useRef<Set<string>>(new Set())

  useEffect(() => () => {
    urls.current.forEach(URL.revokeObjectURL)
    urls.current.clear()
  }, [])

  const create = (file: Blob): string => {
    const url = URL.createObjectURL(file)
    urls.current.add(url)
    return url
  }

  const revoke = (url: string) => {
    if (urls.current.has(url)) {
      URL.revokeObjectURL(url)
      urls.current.delete(url)
    }
  }

  return { create, revoke }
}
