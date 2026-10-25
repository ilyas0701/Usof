import { useState } from 'react'
import Tabs from '../Tabs/Tabs'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import ForgotPasswordForm from './ForgotPasswordForm'
import ResetPasswordForm from './ResetPasswordForm'
import UserProfileCard from './UserProfileCard'
import { useAuth } from '../../hooks/useAuth'
import s from './AuthPanel.module.scss'

const TABS = [
  { key: 'login', label: 'Log in' },
  { key: 'register', label: 'Register' },
]

const CURRENT_YEAR = new Date().getFullYear()

function getInitialState(initialMode, initialResetToken) {
  try {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token') || params.get('confirm_token') || params.get('reset_token') || initialResetToken || ''
    const urlMode = params.get('mode')

    if (token) {
      return { mode: 'reset-password', resetToken: token }
    }
    if (urlMode === 'register' || urlMode === 'login') {
      return { mode: urlMode, resetToken: '' }
    }
  } catch {
  }
  return { mode: initialMode || 'login', resetToken: initialResetToken || '' }
}

export default function AuthPanel({
  isModal = false,
  initialMode = 'login',
  initialResetToken = '',
  onSuccess,
}) {
  const { isAuthenticated } = useAuth()
  const [authConfig, setAuthConfig] = useState(() =>
    getInitialState(initialMode, initialResetToken)
  )


  const mode = authConfig.mode
  const resetToken = authConfig.resetToken

  const setMode = (newMode) => {
    setAuthConfig((prev) => ({ ...prev, mode: newMode }))
  }

  const setTokenAndMode = (newToken, newMode) => {
    setAuthConfig({ mode: newMode, resetToken: newToken })
  }

  return (
    <div className={`${s.container} ${isModal ? '' : s.standalone}`}>
      <header className={`${s.brandHeader} ${isModal ? s.modalHeader : ''}`}>
        <div className={s.brandLogo}>
          <span>USOF</span>
          <span className={s.brandDot} />
        </div>
        <p className={s.brandTagline}>A question and answer platform for developers</p>
      </header>

      <div className={`${s.card} ${isModal ? s.modalCard : ''}`}>
        {isAuthenticated && mode !== 'reset-password' ? (
          <UserProfileCard />
        ) : (
          <>
            {(mode === 'login' || mode === 'register') && (
              <Tabs
                tabs={TABS}
                activeKey={mode}
                onChange={(key) => setMode(key)}
              />
            )}

            {mode === 'login' && (
              <LoginForm
                onForgotPassword={() => setMode('forgot-password')}
                onSwitchToRegister={() => setMode('register')}
                onSuccess={onSuccess}
              />
            )}

            {mode === 'register' && (
              <RegisterForm
                onSwitchToLogin={() => setMode('login')}
              />
            )}

            {mode === 'forgot-password' && (
              <ForgotPasswordForm
                onBackToLogin={() => setMode('login')}
              />
            )}

            {mode === 'reset-password' && (
              <ResetPasswordForm
                token={resetToken}
                onBackToLogin={() => {
                  window.history.replaceState(null, '', '/?view=auth&mode=login')
                  setTokenAndMode('', 'login')
                }}
                onSuccess={() => window.history.replaceState(null, '', '/?view=auth&mode=login')}
              />
            )}
          </>
        )}
      </div>

      {!isModal && (
        <footer className={s.footer}>
          &copy; {CURRENT_YEAR} USOF. All rights reserved.
        </footer>
      )}
    </div>
  )
}
