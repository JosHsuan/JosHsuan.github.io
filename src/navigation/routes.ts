export type Route = { section: 'work' | 'lab' | 'about' | 'contact'; slug?: string; missing?: boolean }
export function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (!parts.length) return { section: 'work' }
  const [section, slug] = parts
  if (!['work', 'lab', 'about', 'contact'].includes(section) || parts.length > 2 || (slug && section !== 'work' && section !== 'lab')) return { section: 'work', missing: true }
  return { section: section as Route['section'], ...(slug ? { slug } : {}) }
}
export const routeKey = (route: Route) => `${route.section}${route.slug ? `/${route.slug}` : ''}${route.missing ? '/not-found' : ''}`
export const routeFromLocation = (hash: string, pathname: string) => parseRoute(hash || (pathname === '/' || pathname === '/index.html' ? '' : `#${pathname.replace(/\/index\.html$/, '').replace(/\/$/, '')}`))
