import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { api } from '../store/api'

export default function useApiResource(path, { skip = false } = {}) {
  const dispatch = useDispatch()
  const scope = useSelector((state) => `${state.auth.token}:${state.auth.user?.role || ''}`)

  const result = api.useResourceQuery({ path, scope }, { skip, refetchOnMountOrArgChange: 30 })
  const inaccessible = result.isError && [401, 403, 404].includes(result.error?.status)

  const setData = useCallback((update) => {
    dispatch(api.util.updateQueryData('resource', { path, scope }, (current) =>
      typeof update === 'function' ? update(current) : update))
  }, [dispatch, path, scope])

  return {
    data: inaccessible ? null : result.currentData ?? null,
    loading: !skip && !result.currentData && !result.isError,
    error: result.error?.message || '',
    reload: result.refetch,
    setData,
  }
}
