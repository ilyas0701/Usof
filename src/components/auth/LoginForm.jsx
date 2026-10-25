import { useState } from 'react'
import TextField from '../TextField/TextField'
import Button from '../Button/Button'
import InformationMessage from '../InformationMessage/InformationMessage'
import { authApi } from '../../api/authApi'
import { useAuth } from '../../hooks/useAuth'
import s from './AuthForm.module.scss'

export default function LoginForm({ onForgotPassword, onSwitchToRegister, onSuccess }) {
  const { loginUser } = useAuth()
  const [formData, setFormData] = useState({ login: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [isEmailUnverified, setIsEmailUnverified] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    if (serverError) {
      setServerError('')
      setIsEmailUnverified(false)
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.login.trim()) {
      newErrors.login = 'Enter your username'
    }
    if (!formData.password) {
      newErrors.password = 'Enter your password'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setServerError('')
    setIsEmailUnverified(false)

    try {
      const response = await authApi.login({
        login: formData.login.trim(),
        password: formData.password,
      })

      loginUser(response.token, { login: formData.login.trim() })
      onSuccess?.()
    } catch (err) {
      if (err.status === 403 && err.message?.toLowerCase().includes('email')) {
        setIsEmailUnverified(true)
        setServerError('Email not verified. Please use the link in the email we sent you.')
      } else {
        setServerError(err.message || 'Unable to log in')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className={s.form} onSubmit={handleSubmit} noValidate>
      {serverError && (
        <InformationMessage
          type="error"
          title={isEmailUnverified ? 'Email verification required' : 'Authentication error'}
          description={serverError}
        />
      )}

      <TextField
        label="Username"
        name="login"
        value={formData.login}
        onChange={handleChange}
        error={errors.login}
        autoComplete="username"
        required
      />

      <TextField
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        autoComplete="current-password"
        required
      />

      <div className={s.forgotPasswordRow}>
        <Button
          variant="additional"
          size="small"
          onClick={onForgotPassword}
          className={s.forgotPasswordBtn}
        >
          Forgot your password?
        </Button>
      </div>

      <div className={s.actions}>
        <Button
          type="submit"
          variant="primary"
          size="medium"
          fullWidth
          loading={submitting}
        >
          Log in
        </Button>
      </div>

      <div className={s.footerPrompt}>
        <span>No account yet?</span>{' '}
        <Button
          variant="underline"
          size="small"
          onClick={onSwitchToRegister}
          className={s.inlineLink}
        >
          Sign up
        </Button>
      </div>
    </form>
  )
}
