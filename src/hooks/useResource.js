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
  const [background, setBackground] = useState(false)

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
  const retainData =
    background && state.source === load && state.sessionKey === sessionKey && state.data !== null
  return {
    data: current || retainData ? state.data : null,
    loading: !current && !retainData,
    error: current ? state.error : '',
    reload: () => {
      setBackground(false)
      setRevision((value) => value + 1)
    },
    refresh: () => {
      setBackground(true)
      setRevision((value) => value + 1)
    },
    setData: (update) =>
      setState((current) => ({
        ...current,
        data: typeof update === 'function' ? update(current.data) : update,
      })),
  }
}
