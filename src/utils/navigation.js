export function navigate(path, replace = false) {
  const url = new URL(path, window.location.origin)
  if (!path.startsWith('/') || url.origin !== window.location.origin) path = '/'
  const state = window.history.state || {}
  const index = Number.isSafeInteger(state.usofIndex) ? state.usofIndex : 0
  if (!replace && !Number.isSafeInteger(state.usofIndex)) {
    window.history.replaceState({ ...state, usofIndex: index }, '')
  }
  window.history[replace ? 'replaceState' : 'pushState']({ ...state, usofIndex: replace ? index : index + 1 }, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function goBack() {
  if (window.history.state?.usofIndex > 0) window.history.back()
  else navigate('/', true)
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
