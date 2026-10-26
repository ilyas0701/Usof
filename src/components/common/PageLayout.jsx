import { useAuth } from '../../hooks/useAuth'
import { followLink, navigate, openLogin } from '../../utils/navigation'
import Button from '../Button/Button'
import AccountMenu from './AccountMenu'
import HeaderSearch from './HeaderSearch'
import s from './Content.module.scss'

export default function PageLayout({ title, children, actions }) {
  const { isAuthenticated } = useAuth()
  return (
    <div className={s.page}>
      <header className={s.header}>
        <div className={s.headerInner}>
          <a className={s.logo} href="/" onClick={(event) => followLink(event, '/')}>USOF</a>
          <HeaderSearch />
          <div className={s.actions}>
            {isAuthenticated ? (
              <AccountMenu />
            ) : (
              <>
                <Button variant="secondary" size="small" onClick={openLogin}>My account</Button>
                <Button variant="primary" size="small" onClick={() => navigate(`/?view=auth&mode=register&returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`)}>Sign up</Button>
              </>
            )}
          </div>
        </div>
      </header>
      <div className={s.yellowBackdrop} aria-hidden="true" />
      <div className={s.contentSurface}>
        <main className={s.main}>
          <div className={s.heading}>
            <h1>{title}</h1>
            {actions}
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}

