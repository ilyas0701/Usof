import Button from '../Button/Button'
import s from './Content.module.scss'

export default function Pagination({ page, total, pageSize = 10, onChange }) {
  const pages = Math.max(1, Math.ceil(Number(total) / pageSize))
  if (pages <= 1 && page === 1) return null

  return (
    <nav className={s.pagination} aria-label="Pagination">
      <Button
        variant="secondary"
        size="small"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </Button>
      <span aria-live="polite">
        {page} / {pages}
      </span>
      <Button
        variant="secondary"
        size="small"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </Button>
    </nav>
  )
}
