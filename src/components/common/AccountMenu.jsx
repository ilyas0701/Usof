import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { followLink } from '../../utils/navigation'
import FloatingAccountPanel from './FloatingAccountPanel'
import s from '../../pages/HomePage.module.scss'

export default function AccountMenu() {
  const { user, logoutUser } = useAuth()
  const [open, setOpen] = useState(false)
  const container = useRef(null)
  const trigger = useRef(null)
  const name = user.login || user.email || 'Profile'

  useEffect(() => {
    if (!open) return
    const closeOutside = (event) => {
      if (!container.current?.contains(event.target)) setOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        trigger.current?.focus()
      }
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const links = [
    ['Questions', '/'],
    ['Ask a question', '/posts/new'],
    ['Users', '/users'],
    ['Profile', `/users/${user.userId}`],
    ['Favorites', '/favorites'],
    ['Following', '/subscriptions'],
  ]

  return (
    <div className={s.profileDropdown} ref={container}>
      <button
        ref={trigger}
        type="button"
        className={s.userBadge}
        aria-label={`Account options for ${name}`}
        aria-expanded={open}
        aria-controls="page-account-menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span className={s.userAvatar}>
          {user.profile_picture ? <img className={s.avatarImage} src={user.profile_picture} alt="" /> : name.charAt(0).toUpperCase()}
        </span>
        <span className={s.userName}>{name}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {open && (
        <FloatingAccountPanel anchorRef={trigger}>
        <nav id="page-account-menu" className={s.profileMenu} aria-label="Account">
          {links.map(([label, href]) => (
            <a key={href} href={href} className={s.profileMenuItem} onClick={(event) => { setOpen(false); followLink(event, href) }}>{label}</a>
          ))}
          {user.role === 'admin' && <a href="/admin" className={s.profileMenuItem}>Admin panel</a>}
          <button type="button" className={s.profileMenuItem} onClick={() => { setOpen(false); logoutUser() }}>Log out</button>
        </nav>
        </FloatingAccountPanel>
      )}
    </div>
  )
}
