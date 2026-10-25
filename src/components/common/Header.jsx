import { useAuth } from '../../hooks/useAuth'
import Button from '../Button/Button'
import s from './Header.module.scss'

export default function Header({ onOpenAuth, searchQuery = '', onSearchChange }) {
  const { isAuthenticated, user, logoutUser } = useAuth()

  const displayName = user?.login || user?.email || (user?.userId ? `User #${user.userId}` : 'Profile')
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <header className={s.header}>
      <div className={s.inner}>
        <div className={s.leftGroup}>
          <a href="#" className={s.logo} onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <span>USOF</span>
          </a>

          <nav className={s.nav}>
            <a href="#questions" className={`${s.navLink} ${s.active}`}>
              Questions
            </a>
            <a href="#users" className={s.navLink}>
              Users
            </a>
          </nav>
        </div>

        <div className={s.searchWrapper}>
          <span className={s.searchIcon}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 14L11.1 11.1"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <input
            type="search"
            className={s.searchInput}
            placeholder="Search questions by topic or tag..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>

        <div className={s.authGroup}>
          {isAuthenticated ? (
            <>
              <div className={s.userPill}>
                <div className={s.avatar}>{initial}</div>
                <span className={s.userName}>{displayName}</span>
              </div>
              <Button
                variant="additional"
                size="small"
                onClick={logoutUser}
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                size="small"
                onClick={() => onOpenAuth('login')}
              >
                Log in
              </Button>
              <Button
                variant="primary"
                size="small"
                onClick={() => onOpenAuth('register')}
              >
                Register
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
