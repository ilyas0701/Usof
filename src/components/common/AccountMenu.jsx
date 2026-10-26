import { useAuth } from '../../hooks/useAuth'
import { navigate } from '../../utils/navigation'
import s from '../../pages/HomePage.module.scss'

export default function AccountMenu() {
  const { user } = useAuth()
  const name = user.login || user.email || 'Profile'
  return (
    <button type="button" className={s.userBadge} onClick={() => navigate(`/users/${user.userId}`)} aria-label={`View ${name}'s profile`}>
      <span className={s.userAvatar}>
        {user.profile_picture ? <img className={s.avatarImage} src={user.profile_picture} alt="" /> : name.charAt(0).toUpperCase()}
      </span>
      <span className={s.userName}>{name}</span>
      <span className={s.userRole}>{user.role === 'admin' ? 'Admin' : 'User'}</span>
    </button>
  )
}
