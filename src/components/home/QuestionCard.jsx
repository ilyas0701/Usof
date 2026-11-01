import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { questionPath } from '../../../shared/questionUrls'
import CommentIcon from '../icons/CommentIcon'
import ShareIcon from '../icons/ShareIcon'
import Reactions from '../common/Reactions'
import { useAuth } from '../../hooks/useAuth'
import { followLink, navigate, openLogin } from '../../utils/navigation'
import { formatDate } from '../../utils/format'
import s from './QuestionCard.module.scss'

export default function QuestionCard({ question, onTagClick, onChange }) {
  const { user, isAuthenticated } = useAuth()
  const [shareMessage, setShareMessage] = useState('')
  const [failedAvatar, setFailedAvatar] = useState(null)

  useEffect(() => {
    if (!shareMessage) return
    const timeout = window.setTimeout(() => setShareMessage(''), 2500)
    return () => window.clearTimeout(timeout)
  }, [shareMessage])
  const path = questionPath(question.id, question.title)
  const author = question.author_login || 'removed'

  const handleAuthor = () => {
    if (!question.author_id) return
    if (!isAuthenticated) return openLogin()
    navigate(`/users/${question.author_id}`)
  }

  const handleShare = async () => {
    setShareMessage('')
    const url = new URL(path, window.location.origin).href
    try {
      if (navigator.share) await navigator.share({ title: question.title, url })
      else {
        await navigator.clipboard.writeText(url)
        setShareMessage('Link copied')
      }
    } catch (error) {
      if (error.name !== 'AbortError')
        setShareMessage('Could not share this question.')
    }
  }

  return (
    <article className={s.threadCard}>
      <div className={s.avatarColumn}>
        <button
          type="button"
          className={s.avatar}
          onClick={handleAuthor}
          aria-label={`View ${author}'s profile`}
          disabled={!question.author_id}
        >
          {question.author_avatar && failedAvatar !== question.author_avatar ? (
            <img
              className={s.avatarImage}
              src={question.author_avatar}
              alt=""
              loading="lazy"
              onError={() => setFailedAvatar(question.author_avatar)}
            />
          ) : author.charAt(0).toUpperCase()}
        </button>
      </div>
      <div className={s.contentColumn}>
        <div className={s.authorLine}>
          <button
            type="button"
            className={s.authorHandle}
            onClick={handleAuthor}
            disabled={!question.author_id}
          >
            {author}
          </button>
          <span className={s.dotSeparator}>·</span>
          <time className={s.timestamp} dateTime={question.publish_date}>
            {formatDate(question.publish_date)}
          </time>
          {Boolean(question.is_locked) && (
            <span className={s.timestamp}>Locked</span>
          )}
          {question.status === 'inactive' && (
            <span className={s.inactiveStatus}>Inactive</span>
          )}
        </div>
        <a
          href={path}
          className={s.postBody}
          onClick={(event) => followLink(event, path)}
        >
          <h2 className={s.title}>{question.title}</h2>
          <p className={s.description}>
            {question.content}
          </p>
        </a>
        <div className={s.tagsRow}>
          {question.categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={s.hashtag}
              onClick={() =>
                onTagClick
                  ? onTagClick(category.title)
                  : navigate(`/categories/${category.id}`)
              }
            >
              {category.title}
            </button>
          ))}
        </div>
        <div className={s.actionsBar}>
          <Reactions
            resource="posts"
            id={question.id}
            initialLikes={question.likes}
            onChange={onChange}
            disabled={
              user?.role !== 'admin' &&
              (Boolean(question.is_locked) || question.status !== 'active')
            }
          />
          <a
            href={`${path}#comments`}
            className={`${s.actionBtn} ${s.commentBtn}`}
            onClick={(event) => followLink(event, `${path}#comments`)}
            aria-label="Replies"
          >
            <CommentIcon width={19} height={19} />
            <span>{question.commentsCount}</span>
          </a>
          <button
            type="button"
            className={s.actionBtn}
            onClick={handleShare}
            aria-label="Share"
          >
            <ShareIcon width={18} height={18} />
          </button>
        </div>
        {shareMessage && createPortal(
          <div className={s.shareToast} role="status">
            {shareMessage}
          </div>, document.body,
        )}
      </div>
      {(user?.role === 'admin' || (isAuthenticated && String(user.userId) === String(question.author_id))) && (
        <a
          href={`/posts/${question.id}/edit`}
          className={s.editPost}
          aria-label={`Edit question: ${question.title}`}
          title="Edit question"
          onClick={(event) => followLink(event, `/posts/${question.id}/edit`)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m16 3 5 5M4 15 15.5 3.5a3.54 3.54 0 0 1 5 5L9 20l-6 1 1-6Z" />
          </svg>
        </a>
      )}
    </article>
  )
}
