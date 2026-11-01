import { useState } from 'react'
import { request } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import { navigate } from '../utils/navigation'
import AuthPage from '../components/auth/AuthPage'
import TextField from '../components/TextField/TextField'
import Button from '../components/Button/Button'
import InformationMessage from '../components/InformationMessage/InformationMessage'
import s from '../components/auth/AuthForm.module.scss'

const LOGIN_REGEX = /^[a-zA-Z0-9_]{3,255}$/
const INVITATION_TOKEN_REGEX = /^[a-f0-9]{64}$/

export default function AcceptInvitationPage({ token }) {
  const { loginUser } = useAuth()
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    passwordConfirmation: '',
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const validToken = INVITATION_TOKEN_REGEX.test(token)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setServerError('')
  }

  const validate = () => {
    const nextErrors = {}

    if (!formData.login.trim()) {
      nextErrors.login = 'Enter your username'
    } else if (!LOGIN_REGEX.test(formData.login.trim())) {
      nextErrors.login = 'Use 3 to 255 characters: Latin letters, digits, and underscores'
    }

    if (!formData.password) {
      nextErrors.password = 'Enter your password'
    } else if (formData.password.length < 3) {
      nextErrors.password = 'Password must be at least 3 characters long'
    }

    if (!formData.passwordConfirmation) {
      nextErrors.passwordConfirmation = 'Confirm your password'
    } else if (formData.password !== formData.passwordConfirmation) {
      nextErrors.passwordConfirmation = 'Passwords do not match'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (submitting || !validToken || !validate()) {
      return
    }

    setSubmitting(true)
    setServerError('')

    try {
      const result = await request('/auth/accept-invitation', {
        method: 'POST',
        body: {
          token,
          login: formData.login.trim(),
          password: formData.password,
          passwordConfirmation: formData.passwordConfirmation,
        },
      })

      loginUser(result.token, result.user)
      navigate('/', true)
    } catch (error) {
      setServerError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthPage title="Create your USOF account" onNavigateHome={() => navigate('/')}>
      <form className={s.form} onSubmit={handleSubmit} noValidate>
        {!validToken && (
          <InformationMessage type="error" description="Invalid invitation link." />
        )}
        {serverError && (
          <InformationMessage type="error" description={serverError} />
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
          disabled={submitting || !validToken}
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
          disabled={submitting || !validToken}
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
          disabled={submitting || !validToken}
        />

        <div className={s.actions}>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={submitting}
            disabled={!validToken}
          >
            Create account and sign in
          </Button>
        </div>
      </form>
    </AuthPage>
  )
}
