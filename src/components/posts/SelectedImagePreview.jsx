import { useEffect, useRef } from 'react'

export default function SelectedImagePreview({ file }) {
  const image = useRef(null)
  useEffect(() => {
    const preview = URL.createObjectURL(file)
    image.current.src = preview
    return () => URL.revokeObjectURL(preview)
  }, [file])
  return <img ref={image} alt={file.name} />
}
