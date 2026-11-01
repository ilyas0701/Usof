import { useState } from 'react'
import TextField from '../TextField/TextField'
import Button from '../Button/Button'
import InformationMessage from '../InformationMessage/InformationMessage'
import ArrowBackIcon from '../icons/ArrowBackIcon'
import { authApi } from '../../api/authApi'
import s from './AuthForm.module.scss'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ForgotPasswordForm({ onBackToLogin }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Enter your email')
      return
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Enter a valid email address')
      return
    }

    setSubmitting(true)
    setServerError('')
    setError('')

    try {
      const response = await authApi.requestPasswordReset({ email: email.trim() })
      setSuccessMessage(
        response?.message || 'If an account with this email exists, password reset instructions have been sent.'
      )
    } catch (err) {
      setServerError(err.message || 'Unable to request a password reset')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={s.formWrapper}>
      <div className={s.headerNavigation}>
        <Button
          variant="additional"
          size="small"
          onClick={onBackToLogin}
          className={s.backBtn}
          aria-label="Back to login"
        >
          <ArrowBackIcon width={18} height={18} />
          <span>Back to login</span>
        </Button>
      </div>

      <div className={s.headerTitleBlock}>
        <h2 className={s.title}>Reset your password</h2>
        <p className={s.subtitle}>
          Enter the email address for your account. We will send you a password reset link.
        </p>
      </div>

      {successMessage ? (
        <div className={s.successBlock}>
          <InformationMessage
            type="success"
            title="Request sent"
            description={successMessage}
          />

          <div className={s.actions}>
            <Button
              type="button"
              variant="primary"
              size="medium"
              fullWidth
              onClick={onBackToLogin}
            >
              Return to login
            </Button>
          </div>
        </div>
      ) : (
        <form className={s.form} onSubmit={handleSubmit} noValidate>
          {serverError && (
            <InformationMessage
              type="error"
              title="Error"
              description={serverError}
            />
          )}

          <TextField
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError('')
              if (serverError) setServerError('')
            }}
            error={error}
            autoComplete="email"
            required
          />

          <div className={s.actions}>
            <Button
              type="submit"
              variant="primary"
              size="medium"
              fullWidth
              loading={submitting}
            >
              Send instructions
            </Button>
          </div>

        </form>
      )}
    </div>
  )
}
