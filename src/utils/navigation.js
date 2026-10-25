export function navigate(path, replace = false) {
  const url = new URL(path, window.location.origin)
  if (!path.startsWith('/') || url.origin !== window.location.origin) path = '/'
  window.history[replace ? 'replaceState' : 'pushState'](null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0 })
}

export function openLogin() {
  navigate(
    `/?view=auth&mode=login&returnTo=${encodeURIComponent(window.location.pathname + window.location.search + window.location.hash)}`,
  )
}

export function openCategoryAdmin() {
  window.location.assign('/admin/resources/DbCategory/actions/new')
}

export function followLink(event, path) {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return
  event.preventDefault()
  navigate(path)
}
