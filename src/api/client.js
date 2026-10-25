export async function request(endpoint, options = {}) {
  const {
    token = localStorage.getItem('usof_auth_token'),
    body,
    responseType,
    ...init
  } = options
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const isJson =
    body != null && !(body instanceof FormData) && typeof body !== 'string'
  if (isJson) headers.set('Content-Type', 'application/json')

  let response
  try {
    response = await fetch(`/api${endpoint}`, {
      ...init,
      headers,
      body: isJson ? JSON.stringify(body) : body,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('Cannot connect to the server. Please try again.')
  }

  if (response.ok && responseType === 'blob') return response.blob()
  const data =
    response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    if (response.status === 401 && token) {
      window.dispatchEvent(
        new CustomEvent('usof:unauthorized', { detail: token }),
      )
    }
    const error = new Error(
      data?.message || `Server error (${response.status})`,
    )
    error.status = response.status
    throw error
  }
  return data
}

export function queryString(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value != null) query.set(key, value)
  })
  return query.size ? `?${query}` : ''
}
