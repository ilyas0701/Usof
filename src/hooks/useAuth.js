import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { sessionStarted, sessionEnded, userUpdated } from '../store/authSlice'
import { authApi } from '../api/authApi'

export function useAuth() {
  const session = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  const updateUser = useCallback((user) => dispatch(userUpdated(user)), [dispatch])

  const loginUser = useCallback((token, user = {}) => dispatch(sessionStarted({ token, user })), [dispatch])

  const logoutUser = useCallback(async () => {
    dispatch(sessionEnded())

    if (session.token) await authApi.logout(session.token).catch(() => {})
  }, [dispatch, session.token])

  return useMemo(() => ({ ...session, isAuthenticated: Boolean(session.token), updateUser, loginUser, logoutUser }),
    [session, updateUser, loginUser, logoutUser])
}
