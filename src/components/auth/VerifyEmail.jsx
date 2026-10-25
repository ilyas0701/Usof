import { useEffect, useState } from 'react'
import { authApi } from '../../api/authApi'
import Button from '../Button/Button'
import InformationMessage from '../InformationMessage/InformationMessage'
import Loader from '../Loader/Loader'
import s from './AuthForm.module.scss'

export default function VerifyEmail({ token, onContinue }) {
  const [result, setResult] = useState({
    status: token ? 'loading' : 'error',
    message: token ? '' : 'This verification link is missing its token.',
  })

  useEffect(() => {
    if (!token) return

    const controller = new AbortController()

    authApi.verifyEmail(token, controller.signal)
      .then(() => setResult({ status: 'success', message: '' }))
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setResult({ status: 'error', message: error.message })
        }
      })

    return () => controller.abort()
  }, [token])

  return (
    <div className={s.formWrapper}>
      <div className={s.headerTitleBlock}>
        <h1 className={s.title}>Email verification</h1>
        <p className={s.subtitle}>
          {result.status === 'loading'
            ? 'We are confirming your email address.'
            : 'Your account verification status is shown below.'}
        </p>
      </div>

      {result.status === 'loading' && (
        <div className={s.verificationLoading} role="status">
          <Loader size={24} />
          <span>Verifying your email...</span>
        </div>
      )}

      {result.status === 'success' && (
        <InformationMessage
          type="success"
          title="Email verified successfully!"
          description="Your account is ready. You can now log in."
        />
      )}

      {result.status === 'error' && (
        <InformationMessage
          type="error"
          title="Email verification failed"
          description={result.message}
        />
      )}

      {result.status !== 'loading' && (
        <div className={s.actions}>
          <Button fullWidth onClick={onContinue}>
            Go to login
          </Button>
        </div>
      )}
    </div>
  )
}
