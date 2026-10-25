import clsx from 'clsx'
import s from './Chip.module.scss'

export default function Chip({ children, active = false, onClick, className }) {
  return (
    <span
      className={clsx(s.chip, active && s.active, className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </span>
  )
}
