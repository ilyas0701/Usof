import { useState } from 'react'
import clsx from 'clsx'
import ShowEyeIcon from '../icons/ShowEyeIcon'
import HideEyeIcon from '../icons/HideEyeIcon'
import CrossIcon from '../icons/CrossIcon'
import s from './TextField.module.scss'

export default function TextField({
  label,
  value = '',
  onChange,
  onFocus,
  onBlur,
  type = 'text',
  name,
  error,
  helperText,
  disabled = false,
  clearable = true,
  autoComplete,
  required = false,
  className,
  ...inputProps
}) {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const isPassword = type === 'password'
  const isFloated = isFocused || (value !== undefined && value !== null && String(value).length > 0)
  const currentInputType = isPassword ? (showPassword ? 'text' : 'password') : type

  const handleClear = (e) => {
    e.stopPropagation()
    onChange?.({ target: { name, value: '' } })
  }

  return (
    <div className={clsx(s.wrapper, className)}>
      <div
        className={clsx(
          s.field,
          isFocused && s.focused,
          error && s.error,
          disabled && s.disabled,
        )}
      >
        <input
          name={name}
          type={currentInputType}
          value={value}
          onChange={onChange}
          onFocus={(event) => { setIsFocused(true); onFocus?.(event) }}
          onBlur={(event) => { setIsFocused(false); onBlur?.(event) }}
          disabled={disabled}
          autoComplete={autoComplete}
          required={required}
          className={s.input}
          placeholder={label}
          {...inputProps}
        />
        <label className={clsx(s.label, isFloated && s.floated)}>
          {label}
        </label>

        <div className={s.actions}>
          {clearable && !disabled && value && (
            <button
              type="button"
              className={s.actionButton}
              onClick={handleClear}
              tabIndex={-1}
              aria-label="Clear"
            >
              <CrossIcon width={12} height={12} />
            </button>
          )}

          {isPassword && !disabled && (
            <button
              type="button"
              className={s.actionButton}
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <HideEyeIcon width={18} height={18} /> : <ShowEyeIcon width={18} height={18} />}
            </button>
          )}
        </div>
      </div>

      {(error || helperText) && (
        <div className={clsx(s.helperText, error && s.error)}>
          {error || helperText}
        </div>
      )}
    </div>
  )
}
