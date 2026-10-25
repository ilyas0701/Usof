import { useState } from 'react'
import TextField from '../TextField/TextField'
import Button from '../Button/Button'
import InformationMessage from '../InformationMessage/InformationMessage'
import ArrowBackIcon from '../icons/ArrowBackIcon'
import { authApi } from '../../api/authApi'
import s from './AuthForm.module.scss'

export default function ResetPasswordForm({ token, onBackToLogin, onSuccess }) {
  const [formData, setFormData] = useState({
    newPassword: '',
    newPasswordConfirmation: '',
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
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
    if (!formData.newPassword) {
      newErrors.newPassword = 'Enter a new password'
    } else if (formData.newPassword.length < 3 || formData.newPassword.length > 155) {
      newErrors.newPassword = 'Use 3 to 155 characters'
    }
    if (!formData.newPasswordConfirmation) {
      newErrors.newPasswordConfirmation = 'Confirm your new password'
    } else if (formData.newPassword !== formData.newPasswordConfirmation) {
      newErrors.newPasswordConfirmation = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token || !validate()) return

    setSubmitting(true)
    setServerError('')

    try {
      const response = await authApi.resetPassword({
        token,
        newPassword: formData.newPassword,
        newPasswordConfirmation: formData.newPasswordConfirmation,
      })

      setSuccessMessage(response?.message || 'Password changed successfully!')
      onSuccess?.()
    } catch (err) {
      setServerError(err.message || 'Unable to reset your password. The token may be invalid or expired.')
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

      {!successMessage ? (
        <div className={s.headerTitleBlock}>
          <h2 className={s.title}>New password</h2>
          <p className={s.subtitle}>
            Choose a new password for your account.
          </p>
        </div>
      ) : (
        <div className={s.headerTitleBlock}>
          <h2 className={s.title}>Password changed</h2>
        </div>
      )}

      {successMessage ? (
        <div className={s.successBlock}>
          <div className={s.actions}>
            <Button
              type="button"
              variant="primary"
              size="medium"
              fullWidth
              onClick={onBackToLogin}
            >
              Log in with your new password
            </Button>
          </div>
        </div>
      ) : (
        <form className={s.form} onSubmit={handleSubmit} noValidate>
          {!token && (
            <InformationMessage
              type="error"
              title="Reset link is incomplete"
              description="Request a new password reset email and follow its link."
            />
          )}

          {serverError && (
            <InformationMessage
              type="error"
              title="Password reset error"
              description={serverError}
            />
          )}

          <TextField
            label="New password"
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
            helperText="3 to 155 characters"
            autoComplete="new-password"
            required
          />

          <TextField
            label="Confirm password"
            name="newPasswordConfirmation"
            type="password"
            value={formData.newPasswordConfirmation}
            onChange={handleChange}
            error={errors.newPasswordConfirmation}
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
              disabled={!token}
            >
              Save password
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
