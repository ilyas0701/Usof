import { useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function FloatingAccountPanel({ anchorRef, children }) {
  const [position, setPosition] = useState(null)

  useLayoutEffect(() => {
    const update = () => {
      const rect = anchorRef.current?.getBoundingClientRect()
      if (rect) setPosition({ top: rect.bottom, left: rect.left, width: rect.width })
    }
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [anchorRef])
  if (!position) return null
  return createPortal(
    <div style={{ position: 'fixed', ...position, zIndex: 1000 }} onPointerDown={(event) => event.stopPropagation()}>
      {children}
    </div>,
    document.body,
  )
}
