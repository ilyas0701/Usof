import { useState, useMemo, useEffect, useCallback } from 'react'
import { AuthContext } from './authContextInstance'
import { authApi } from '../api/authApi'
import { usersApi } from '../api/usersApi'

const TOKEN_KEY = 'usof_auth_token'
const USER_KEY = 'usof_auth_user'

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(
      decodeURIComponent(
        Array.from(
          atob(base64),
          (c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`,
        ).join(''),
      ),
    )
  } catch {
    return null
  }
}

function getInitialAuth() {
  const token = localStorage.getItem(TOKEN_KEY) || ''
  const payload = parseJwt(token)
  if (!payload || !payload.exp || payload.exp * 1000 <= Date.now()) {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    return { token: '', user: null }
  }
  try {
    return {
      token,
      user: {
        ...payload,
        ...JSON.parse(localStorage.getItem(USER_KEY) || '{}'),
      },
    }
  } catch {
    return { token, user: payload }
  }
}

export default function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(getInitialAuth)
  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setAuthState({ token: '', user: null })
  }, [])

  const updateUser = useCallback((user) => {
    setAuthState((current) => {
      if (!current.token) return current
      const updated = { ...parseJwt(current.token), ...user }
      localStorage.setItem(USER_KEY, JSON.stringify(updated))
      return { ...current, user: updated }
    })
  }, [])

  const loginUser = useCallback((token, user = {}) => {
    const combinedUser = { ...parseJwt(token), ...user }
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(combinedUser))
    setAuthState({ token, user: combinedUser })
  }, [])

  const logoutUser = useCallback(async () => {
    const token = authState.token
    clearSession()
    if (token) await authApi.logout(token).catch(() => {})
  }, [authState.token, clearSession])

  useEffect(() => {
    if (!authState.token) return
    const controller = new AbortController()
    const payload = parseJwt(authState.token)
    usersApi
      .get(payload.userId, controller.signal)
      .then((user) => {
        if (!controller.signal.aborted) updateUser(user)
      })
      .catch(() => {})
    const timeout = window.setTimeout(
      clearSession,
      Math.min(Math.max(payload.exp * 1000 - Date.now(), 0), 2147483647),
    )
    const handleUnauthorized = (event) => {
      if (event.detail === authState.token) clearSession()
    }
    window.addEventListener('usof:unauthorized', handleUnauthorized)
    return () => {
      controller.abort()
      window.clearTimeout(timeout)
      window.removeEventListener('usof:unauthorized', handleUnauthorized)
    }
  }, [authState.token, clearSession, updateUser])

  const value = useMemo(
    () => ({
      ...authState,
      isAuthenticated: Boolean(authState.token),
      loginUser,
      logoutUser,
      updateUser,
    }),
    [authState, loginUser, logoutUser, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
