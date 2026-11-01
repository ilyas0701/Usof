import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { api } from '../store/api'

export default function useApiResource(path, { skip = false, keepPreviousData = false } = {}) {
  const dispatch = useDispatch()
  const scope = useSelector((state) => `${state.auth.token}:${state.auth.user?.role || ''}`)

  const result = api.useResourceQuery({ path, scope }, { skip, refetchOnMountOrArgChange: 30 })
  const [previous, setPrevious] = useState(null)

  if (keepPreviousData && result.currentData &&
      (previous?.data !== result.currentData || previous?.scope !== scope)) {
    setPrevious({ scope, data: result.currentData })
  }

  const inaccessible = result.isError && [401, 403, 404].includes(result.error?.status)

  const setData = useCallback((update) => {
    dispatch(api.util.updateQueryData('resource', { path, scope }, (current) =>
      typeof update === 'function' ? update(current) : update))
  }, [dispatch, path, scope])

  const previousData = keepPreviousData && result.isFetching && previous?.scope === scope
    ? previous.data
    : null
  const data = inaccessible ? null : result.currentData ?? previousData

  return {
    data,
    loading: !skip && !data && !result.isError,
    fetching: !skip && result.isFetching,
    error: result.error?.message || '',
    reload: result.refetch,
    setData,
  }
}
