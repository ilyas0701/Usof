import clsx from 'clsx'
import s from './InformationMessage.module.scss'

export default function InformationMessage({
  title,
  description,
  type = 'info',
  className,
}) {
  return (
    <div className={clsx(s.message, s[type], className)} role="alert">
      <div className={s.content}>
        {title && <div className={s.title}>{title}</div>}
        {description && <div className={s.description}>{description}</div>}
      </div>
    </div>
  )
}
