import { useEffect, useState } from 'react'

export default function useResource(load, sessionKey = '') {
  const [state, setState] = useState({
    source: null,
    revision: -1,
    sessionKey: '',
    data: null,
    error: '',
  })
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    Promise.resolve()
      .then(() => load(controller.signal))
      .then(
        (data) => {
          if (!controller.signal.aborted)
            setState({ source: load, revision, sessionKey, data, error: '' })
        },
        (error) => {
          if (!controller.signal.aborted)
            setState({
              source: load,
              revision,
              sessionKey,
              data: null,
              error: error.message,
            })
        },
      )
    return () => controller.abort()
  }, [load, revision, sessionKey])

  const current =
    state.source === load &&
    state.revision === revision &&
    state.sessionKey === sessionKey
  return {
    data: current ? state.data : null,
    loading: !current,
    error: current ? state.error : '',
    reload: () => setRevision((value) => value + 1),
    setData: (update) =>
      setState((current) => ({
        ...current,
        data: typeof update === 'function' ? update(current.data) : update,
      })),
  }
}
