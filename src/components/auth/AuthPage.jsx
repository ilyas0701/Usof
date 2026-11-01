import { useState } from 'react'
import ArrowGoToBoldIcon from '../icons/ArrowGoToBoldIcon'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import ForgotPasswordForm from './ForgotPasswordForm'
import ResetPasswordForm from './ResetPasswordForm'
import UserProfileCard from './UserProfileCard'
import VerifyEmail from './VerifyEmail'
import HeaderSearch from '../common/HeaderSearch'
import { useAuth } from '../../hooks/useAuth'
import { goBack } from '../../utils/navigation'
import s from './AuthPage.module.scss'

export default function AuthPage({
  initialMode = 'login',
  initialResetToken = '',
  verificationToken = '',
  onNavigateHome,
  onLoginSuccess,
  children,
  title,
}) {
  const { isAuthenticated } = useAuth()
  const [mode, setMode] = useState(initialMode)
  const [resetToken, setResetToken] = useState(initialResetToken)

  return (
    <div className={s.authPage}>
      <header className={s.header}>
        <a
          href="#"
          className={s.logoLink}
          onClick={(e) => {
            e.preventDefault()
            onNavigateHome?.()
          }}
          aria-label="Back to home"
        >
          <span className={s.logoText}>USOF</span>
        </a>

        <HeaderSearch />
        <div className={s.headerRight}>
          {onNavigateHome && (
            <button
              type="button"
              className={s.homeBackLink}
              onClick={goBack}
            >
              Back
            </button>
          )}
        </div>
      </header>

      <main className={s.contentWrapper}>
        <div className={s.card}>
          {title && <h1 className={s.cardTitle}>{title}</h1>}
          {children || (isAuthenticated &&
          mode !== 'verify-email' &&
          mode !== 'reset-password' ? (
            <UserProfileCard />
          ) : (
            <>
              {mode === 'verify-email' && (
                <VerifyEmail
                  token={verificationToken}
                  onContinue={() => {
                    window.history.replaceState(
                      null,
                      '',
                      '/?view=auth&mode=login',
                    )
                    setMode('login')
                  }}
                />
              )}

              {mode === 'login' && (
                <>
                  <h1 className={s.cardTitle}>Welcome to USOF!</h1>
                  <LoginForm
                    onForgotPassword={() => setMode('forgot-password')}
                    onSwitchToRegister={() => setMode('register')}
                    onSuccess={onLoginSuccess || onNavigateHome}
                  />
                </>
              )}

              {mode === 'register' && (
                <>
                  <h1 className={s.cardTitle}>Create your USOF account</h1>
                  <RegisterForm onSwitchToLogin={() => setMode('login')} />
                </>
              )}

              {mode === 'forgot-password' && (
                <ForgotPasswordForm onBackToLogin={() => setMode('login')} />
              )}

              {mode === 'reset-password' && (
                <ResetPasswordForm
                  token={resetToken}
                  onSuccess={() => {
                    window.history.replaceState(
                      null,
                      '',
                      '/?view=auth&mode=login',
                    )
                  }}
                  onBackToLogin={() => {
                    window.history.replaceState(
                      null,
                      '',
                      '/?view=auth&mode=login',
                    )
                    setResetToken('')
                    setMode('login')
                  }}
                />
              )}
            </>
          ))}
        </div>

        {!children && !isAuthenticated && mode === 'login' && (
          <button
            type="button"
            className={s.onboardingButton}
            onClick={() => setMode('register')}
          >
            <span className={s.onboardingContent}>
              <span className={s.onboardingText}>New to USOF?</span>
              <ArrowGoToBoldIcon
                width={18}
                height={18}
                className={s.arrowIcon}
              />
            </span>
          </button>
        )}

        {!children && !isAuthenticated && mode === 'register' && (
          <button
            type="button"
            className={s.onboardingButton}
            onClick={() => setMode('login')}
          >
            <span className={s.onboardingContent}>
              <span className={s.onboardingText}>
                Already have a USOF account? Log in
              </span>
              <ArrowGoToBoldIcon
                width={18}
                height={18}
                className={s.arrowIcon}
              />
            </span>
          </button>
        )}
      </main>
    </div>
  )
}
