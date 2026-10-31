import { useEffect, useState } from 'react'
import { postsApi } from '../../api/postsApi'
import { useAuth } from '../../hooks/useAuth'
import ResourceState from '../common/ResourceState'

export default function PostImage({ postId, image, index }) {
  const { token } = useAuth()
  const source = `${postId}/${image.id}/${token}`
  const [state, setState] = useState({ source: '', url: '', error: '' })
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let url
    postsApi
      .image(postId, image.id, controller.signal)
      .then((blob) => {
        if (controller.signal.aborted) return
        url = URL.createObjectURL(blob)
        setState({ source, url, error: '' })
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({ source, url: '', error: error.message })
      })
    return () => {
      controller.abort()
      if (url) URL.revokeObjectURL(url)
    }
  }, [postId, image.id, source, revision])
  if (state.source !== source || !state.url)
    return (
      <ResourceState
        loading={!state.error}
        error={state.error}
        onRetry={() => setRevision((value) => value + 1)}
      />
    )

  return (
    <a href={state.url} target="_blank" rel="noreferrer">
      <img src={state.url} alt={`Post attachment ${index + 1}`} />
    </a>
  )
}
