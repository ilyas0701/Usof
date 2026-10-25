import { useState } from 'react'
import TextField from '../TextField/TextField'
import Button from '../Button/Button'
import InformationMessage from '../InformationMessage/InformationMessage'
import { authApi } from '../../api/authApi'
import s from './AuthForm.module.scss'

const LOGIN_REGEX = /^[a-zA-Z0-9_]{3,255}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterForm({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    login: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [successInfo, setSuccessInfo] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    if (serverError) {
      setServerError('')
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.login.trim()) {
      newErrors.login = 'Enter your username'
    } else if (!LOGIN_REGEX.test(formData.login.trim())) {
      newErrors.login = 'Use 3 to 255 characters: Latin letters, digits, and underscores'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Enter your email'
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Enter your password'
    } else if (formData.password.length < 3) {
      newErrors.password = 'Password must be at least 3 characters long'
    }

    if (!formData.passwordConfirmation) {
      newErrors.passwordConfirmation = 'Confirm your password'
    } else if (formData.password !== formData.passwordConfirmation) {
      newErrors.passwordConfirmation = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setServerError('')

    try {
      const user = await authApi.register({
        login: formData.login.trim(),
        email: formData.email.trim(),
        password: formData.password,
        passwordConfirmation: formData.passwordConfirmation,
      })

      setSuccessInfo(user)
    } catch (err) {
      setServerError(err.message || 'Registration error')
    } finally {
      setSubmitting(false)
    }
  }

  if (successInfo) {
    return (
      <div className={s.successBlock}>
        <InformationMessage
          type="success"
          title="Registration successful!"
          description={`We sent a verification email to ${formData.email}. Check your inbox and spam folder, then follow the link to activate your account before logging in.`}
        />

        <div className={s.actions}>
          <Button
            type="button"
            variant="primary"
            size="medium"
            fullWidth
            onClick={onSwitchToLogin}
          >
            Go to login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form className={s.form} onSubmit={handleSubmit} noValidate>
      {serverError && (
        <InformationMessage
          type="error"
          title="Registration error"
          description={serverError}
        />
      )}

      <TextField
        label="Username"
        name="login"
        value={formData.login}
        onChange={handleChange}
        error={errors.login}
        helperText={!errors.login ? 'At least 3 characters: Latin letters, digits, and underscores' : undefined}
        autoComplete="username"
        required
      />

      <TextField
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        autoComplete="email"
        required
      />

      <TextField
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        helperText={!errors.password ? 'At least 3 characters' : undefined}
        autoComplete="new-password"
        required
      />

      <TextField
        label="Confirm password"
        name="passwordConfirmation"
        type="password"
        value={formData.passwordConfirmation}
        onChange={handleChange}
        error={errors.passwordConfirmation}
        autoComplete="new-password"
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
          Sign up
        </Button>
      </div>

      <div className={s.footerPrompt}>
        <span>Already have an account?</span>{' '}
        <Button
          variant="underline"
          size="small"
          onClick={onSwitchToLogin}
          className={s.inlineLink}
        >
          Log in
        </Button>
      </div>
    </form>
  )
}
