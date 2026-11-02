import { useEffect, useEffectEvent } from 'react'

export default function usePostEvents(postId, token, onChange) {
  const refresh = useEffectEvent(onChange)

  useEffect(() => {
    if (!postId) return
    const controller = new AbortController()
    let retry

    const connect = async () => {
      let reader
      let reconnect = true
      try {
        const response = await fetch(`/api/posts/${postId}/events`, {
          headers: {
            Accept: 'text/event-stream',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
        })
        if (!response.ok) {
          if ([401, 403, 404].includes(response.status)) reconnect = false
          if (response.status === 401 && token) {
            window.dispatchEvent(
              new CustomEvent('usof:unauthorized', { detail: token }),
            )
          }
          return
        }
        reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        while (!controller.signal.aborted) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          let boundary
          while ((boundary = buffer.indexOf('\n\n')) !== -1) {
            const event = buffer.slice(0, boundary)
            buffer = buffer.slice(boundary + 2)
            const ready = event.startsWith('event: ready\n')
            if (ready || event.startsWith('event: comments-changed\n')) {
              await refresh(controller.signal, ready)
            }
          }
        }
      } catch (error) {
        if (error.name === 'AbortError') return
      } finally {
        await reader?.cancel().catch(() => {})
        if (!controller.signal.aborted && reconnect)
          retry = window.setTimeout(connect, 3000)
      }
    }

    connect()
    return () => {
      controller.abort()
      window.clearTimeout(retry)
    }
  }, [postId, token])
}
