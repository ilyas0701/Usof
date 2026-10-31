import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../../hooks/useAuth'
import { followLink, openLogin } from '../../utils/navigation'
import CrossIcon from '../icons/CrossIcon'
import drawer from '../home/FilterDrawer.module.scss'
import s from './SiteMenu.module.scss'

export default function SiteMenu() {
  const { user, isAuthenticated, logoutUser } = useAuth()
  const [open, setOpen] = useState(false)
  const panel = useRef(null)
  const closeButton = useRef(null)
  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus()
    const onKey = (event) => {
      if (event.key === 'Escape') close()
      if (event.key === 'Tab') {
        const items = panel.current?.querySelectorAll('button:not([disabled]), a[href]')
        if (!items?.length) return
        const first = items[0]
        const last = items[items.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    window.addEventListener('popstate', close)
    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('popstate', close)
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    }
  }, [open, close])
  const links = [['Questions', '/']]
  if (isAuthenticated) links.push(
    ['Ask a question', '/posts/new'],
    ['My profile', `/users/${user.userId}`],
    ['My posts', `/users/${user.userId}?tab=posts`],
    ['Favorites', '/favorites'], ['Following', '/subscriptions'],
  )
  return createPortal(
    <>
      {!open && <button type="button" className={s.trigger} onClick={() => setOpen(true)} aria-label="Open navigation menu" aria-haspopup="dialog" aria-expanded={open}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>}
      {open && <>
        <div className={drawer.backdrop} onClick={close} aria-hidden="true" />
        <aside ref={panel} className={drawer.drawer} role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className={drawer.header}>
            <h2 className={drawer.title}>Menu</h2>
            <button ref={closeButton} type="button" className={drawer.closeButton} onClick={close} aria-label="Close menu"><CrossIcon width={24} height={24} fill="currentColor" /></button>
          </div>
          <div className={drawer.body}>
            <nav className={s.links} aria-label="Main navigation">
              {links.map(([label, href]) => <a key={href} href={href} className={s.item} onClick={(event) => followLink(event, href)}>{label}<span aria-hidden="true">›</span></a>)}
            </nav>
            {user?.role === 'admin' && <section className={s.adminSection} aria-labelledby="admin-menu-heading">
              <h3 id="admin-menu-heading" className={s.sectionLabel}>Administration</h3>
              <nav className={s.links} aria-label="Administration">
                {[['Manage users', '/manage/users'], ['Manage categories', '/manage/categories']].map(([label, href]) => (
                  <a key={href} href={href} className={s.item} onClick={(event) => followLink(event, href)}>{label}<span aria-hidden="true">›</span></a>
                ))}
              </nav>
            </section>}
            <button type="button" className={s.item} onClick={() => { close(); if (isAuthenticated) logoutUser(); else openLogin() }}>{isAuthenticated ? 'Log out' : 'Log in'}</button>
          </div>
        </aside>
      </>}
    </>, document.body,
  )
}
