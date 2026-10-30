import { useState } from 'react'
import { reactionsApi } from '../../api/postsApi'
import { useAuth } from '../../hooks/useAuth'
import { openLogin } from '../../utils/navigation'
import HeartIcon from '../icons/HeartIcon'
import DislikeIcon from '../icons/DislikeIcon'
import InformationMessage from '../InformationMessage/InformationMessage'
import s from '../home/QuestionCard.module.scss'

export default function Reactions({
  resource,
  id,
  initialLikes = [],
  disabled = false,
  onChange,
}) {
  const { user, isAuthenticated } = useAuth()
  const [state, setState] = useState({
    source: initialLikes,
    likes: initialLikes,
  })
  const [busy, setBusy] = useState(false)
  const likes = busy || state.source === initialLikes ? state.likes : initialLikes
  const setLikes = (likes) => {
    setState({ source: initialLikes, likes })
    onChange?.(likes)
  }
  const [error, setError] = useState('')
  const ownReaction = likes.find(
    (like) => String(like.author_id) === String(user?.userId),
  )?.type

  const handleReact = async (type) => {
    if (!isAuthenticated) return openLogin()
    if (busy) return
    setBusy(true)
    setError('')
    const previousLikes = likes
    const nextLikes = likes.filter(
      (like) => String(like.author_id) !== String(user.userId),
    )
    if (ownReaction !== type)
      nextLikes.push({ author_id: user.userId, type })
    setState({ source: initialLikes, likes: nextLikes })
    try {
      if (ownReaction) await reactionsApi.remove(resource, id)
      if (ownReaction !== type) await reactionsApi.add(resource, id, type)
      setLikes(await reactionsApi.list(resource, id))
    } catch (err) {
      setError(err.message)
      try {
        setLikes(await reactionsApi.list(resource, id))
      } catch {
        setLikes(previousLikes)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className={s.actionsBar}>
        <button
          type="button"
          disabled={busy || disabled}
          aria-label="Like"
          aria-pressed={ownReaction === 'like'}
          className={`${s.actionBtn} ${s.likeBtn} ${ownReaction === 'like' ? s.liked : ''}`}
          onClick={() => handleReact('like')}
        >
          <HeartIcon width={19} height={19} filled={ownReaction === 'like'} />
          <span>{likes.filter((like) => like.type === 'like').length}</span>
        </button>
        <button
          type="button"
          disabled={busy || disabled}
          aria-label="Dislike"
          aria-pressed={ownReaction === 'dislike'}
          className={`${s.actionBtn} ${ownReaction === 'dislike' ? s.liked : ''}`}
          onClick={() => handleReact('dislike')}
        >
          <DislikeIcon aria-hidden="true" />
          <span>{likes.filter((like) => like.type === 'dislike').length}</span>
        </button>
      </div>
      {error && <InformationMessage type="error" description={error} />}
    </div>
  )
}
