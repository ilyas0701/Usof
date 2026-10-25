import clsx from 'clsx'
import Loader from '../Loader/Loader'
import s from './Button.module.scss'

export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  className,
  type = 'button',
  onClick,
  ...props
}) {
  const variantClass = variant === 'primary-black' ? s.primaryBlack : s[variant]

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={clsx(
        s.button,
        variantClass,
        s[size],
        fullWidth && s.fullWidth,
        disabled && s.disabled,
        loading && s.loading,
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader
          size={size === 'small' ? 18 : 22}
          variant={variant === 'primary' ? 'secondary' : variant === 'primary-black' ? 'secondary' : 'primary'}
        />
      ) : (
        <>
          {icon && <span className={s.iconWrapper}>{icon}</span>}
          <span className={s.content}>{children}</span>
        </>
      )}
    </button>
  )
}
