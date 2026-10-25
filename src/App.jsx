import { useEffect, useState } from 'react'
import AuthProvider from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import HomePage from './pages/HomePage'
import AuthPage from './components/auth/AuthPage'
import PostPage from './pages/PostPage'
import PostEditorPage from './pages/PostEditorPage'
import PostListPage from './pages/PostListPage'
import ProfilePage from './pages/ProfilePage'
import DirectoryPage from './pages/DirectoryPage'
import PageLayout from './components/common/PageLayout'
import Button from './components/Button/Button'
import { navigate } from './utils/navigation'

function readLocation() {
  return {
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
  }
}

function AppRoutes() {
  const [location, setLocation] = useState(readLocation)
  const { isAuthenticated, user } = useAuth()
  useEffect(() => {
    const update = () => setLocation(readLocation())
    window.addEventListener('popstate', update)
    return () => window.removeEventListener('popstate', update)
  }, [])
  const { pathname, search } = location
  const params = new URLSearchParams(search)
  const resetToken =
    params.get('token') ||
    params.get('confirm_token') ||
    params.get('reset_token') ||
    ''
  const isVerification = pathname === '/verify-email'
  const isReset = pathname === '/password-reset'
  const isAuth =
    params.get('view') === 'auth' ||
    ['login', 'register'].includes(params.get('mode')) ||
    isVerification ||
    isReset
  const protectedPage =
    pathname === '/posts/new' ||
    /^\/posts\/\d+\/edit$/.test(pathname) ||
    pathname.startsWith('/users') ||
    ['/favorites', '/subscriptions'].includes(pathname)
  const openAuth = (mode = 'login') => navigate(`/?view=auth&mode=${mode}`)
  const backHome = () => navigate('/')
  const returnTo =
    params.get('returnTo') ||
    (protectedPage ? pathname + search + location.hash : '/')

  if (isAuth || (protectedPage && !isAuthenticated)) {
    if (isAuthenticated && !isVerification && !isReset)
      return <ProfilePage key={user.userId} id={String(user.userId)} />
    return (
      <AuthPage
        key={pathname + search}
        initialMode={
          isVerification
            ? 'verify-email'
            : isReset
              ? 'reset-password'
              : params.get('mode') || 'login'
        }
        initialResetToken={resetToken}
        verificationToken={resetToken}
        onNavigateHome={backHome}
        onLoginSuccess={() => navigate(returnTo, true)}
      />
    )
  }
  if (pathname === '/') return <HomePage onOpenAuth={openAuth} />
  if (pathname === '/posts/new') return <PostEditorPage />
  let match = pathname.match(/^\/posts\/(\d+)\/edit$/)
  if (match) return <PostEditorPage key={pathname} id={match[1]} />
  match = pathname.match(/^\/posts\/(\d+)$/)
  if (match) return <PostPage key={pathname} id={match[1]} />
  match = pathname.match(/^\/comments\/(\d+)$/)
  if (match) return <PostPage key={pathname} commentId={match[1]} />
  match = pathname.match(/^\/categories\/(\d+)$/)
  if (match) return <PostListPage key={pathname} categoryId={match[1]} />
  match = pathname.match(/^\/users\/(\d+)$/)
  if (match) return <ProfilePage key={pathname} id={match[1]} />
  if (pathname === '/users') return <DirectoryPage key={pathname} />
  if (pathname === '/favorites' || pathname === '/subscriptions')
    return <PostListPage key={pathname} collection={pathname.slice(1)} />
  return (
    <PageLayout title="Page not found">
      <Button variant="secondary" onClick={backHome}>
        Back to home
      </Button>
    </PageLayout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
