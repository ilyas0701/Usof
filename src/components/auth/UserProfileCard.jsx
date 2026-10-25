import { useAuth } from '../../hooks/useAuth'
import Button from '../Button/Button'
import s from './UserProfileCard.module.scss'

export default function UserProfileCard() {
  const { user, logoutUser } = useAuth()

  const displayName = user?.login || user?.email || (user?.userId ? `User #${user.userId}` : 'User')
  const initial = displayName.charAt(0).toUpperCase()
  const role = user?.role || 'user'

  return (
    <div className={s.card}>
      <div className={s.avatarWrapper}>
        <div className={s.avatar}>{initial}</div>
        <div className={s.onlineBadge} title="Online" />
      </div>

      <h2 className={s.name}>{displayName}</h2>
      <div className={s.badges}>
        <span className={s.roleBadge}>{role.toUpperCase()}</span>
      </div>

      <div className={s.actions}>
        <Button
          type="button"
          variant="primary-black"
          size="medium"
          fullWidth
          onClick={logoutUser}
        >
          Log out
        </Button>
      </div>
    </div>
  )
}
