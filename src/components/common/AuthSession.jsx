import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useAuth } from '../../hooks/useAuth'
import useApiResource from '../../hooks/useApiResource'
import { parseJwt, sessionEnded } from '../../store/authSlice'

export default function AuthSession({ children }) {
  const { token, user, updateUser } = useAuth()
  const dispatch = useDispatch()

  const profile = useApiResource(`/users/${user?.userId}`, { skip: !token })

  useEffect(() => {
    if (profile.data) updateUser(profile.data)
  }, [profile.data, updateUser])

  useEffect(() => {
    if (!token) return

    const timeout = window.setTimeout(() => dispatch(sessionEnded()),
      Math.min(Math.max((parseJwt(token)?.exp || 0) * 1000 - Date.now(), 0), 2147483647))

    const unauthorized = (event) => {
      if (event.detail === token) dispatch(sessionEnded())
    }

    window.addEventListener('usof:unauthorized', unauthorized)

    return () => {
      window.clearTimeout(timeout)
      window.removeEventListener('usof:unauthorized', unauthorized)
    }
  }, [token, dispatch])

  return children
}

