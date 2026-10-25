import { useState } from 'react'
import { commentsApi } from '../../api/postsApi'
import { useAuth } from '../../hooks/useAuth'
import { followLink } from '../../utils/navigation'
import { formatDate } from '../../utils/format'
import Reactions from '../common/Reactions'
import DeleteButton from '../common/DeleteButton'
import Button from '../Button/Button'
import InformationMessage from '../InformationMessage/InformationMessage'
import s from '../common/Content.module.scss'

export default function CommentItem({
  comment,
  author,
  post,
  parent,
  parentAuthor,
  depth = 0,
  onReply,
  onUpdate,
  onDelete,
}) {
  const { user, isAuthenticated } = useAuth()
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(comment.content)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const isOwner = String(user?.userId) === String(comment.author_id)
  const disabled =
    user?.role !== 'admin' &&
    (Boolean(post.is_locked) ||
      post.status !== 'active' ||
      Boolean(comment.is_locked) ||
      comment.status !== 'active')
  const update = async (body) => {
    setBusy(true)
    setError('')
    try {
      const updated = await commentsApi.update(comment.id, body)
      onUpdate({ ...updated, likes: comment.likes })
      setContent(updated.content)
      setEditing(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }
  const authorPath = `/users/${comment.author_id}`
  const commentPath = `/comments/${comment.id}`

  return (
    <article
      id={`comment-${comment.id}`}
      className={s.comment}
      style={{ '--reply-depth': Math.min(depth, 2) }}
    >
      <div className={s.meta}>
        {isAuthenticated && comment.author_id ? (
          <a
            href={authorPath}
            onClick={(event) => followLink(event, authorPath)}
          >
            {author ? `@${author.login}` : `User #${comment.author_id}`}
          </a>
        ) : (
          <span>
            {comment.author_id ? `User #${comment.author_id}` : 'removed'}
          </span>
        )}
        <a
          href={commentPath}
          onClick={(event) => followLink(event, commentPath)}
        >
          <time dateTime={comment.publish_date}>
            {formatDate(comment.publish_date)}
          </time>
        </a>
        {Boolean(comment.is_locked) && <span>Locked</span>}
        {comment.status === 'inactive' && <span>Inactive</span>}
      </div>
      {parent && (
        <a href={`#comment-${parent.id}`} className={s.replyContext}>
          <span className={s.muted}>
            In reply to{' '}
            {parentAuthor
              ? `@${parentAuthor.login}`
              : `User #${parent.author_id}`}
          </span>
          <span>
            {parent.content.length > 140
              ? `${parent.content.slice(0, 140)}…`
              : parent.content}
          </span>
        </a>
      )}
      {error && <InformationMessage type="error" description={error} />}
      {editing ? (
        <form
          className={s.form}
          onSubmit={(event) => {
            event.preventDefault()
            update({ content: content.trim() })
          }}
        >
          <label className={s.label}>
            Edit comment
            <textarea
              className={`${s.textarea} ${s.smallTextarea}`}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              required
              maxLength={65535}
              disabled={busy}
            />
          </label>
          <div className={s.actions}>
            <Button
              type="submit"
              variant="primary-black"
              size="small"
              loading={busy}
            >
              Save
            </Button>
            <Button
              variant="secondary"
              size="small"
              disabled={busy}
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <p className={s.text}>{comment.content}</p>
      )}
      <div className={s.actions}>
        <Reactions
          resource="comments"
          id={comment.id}
          initialLikes={comment.likes}
          disabled={disabled}
        />
        <Button
          variant="additional"
          size="small"
          disabled={busy || disabled}
          onClick={() => onReply(comment)}
        >
          Reply
        </Button>
        {isOwner && (
          <>
            <Button
              variant="additional"
              size="small"
              disabled={busy}
              onClick={() => {
                setContent(comment.content)
                setEditing(true)
              }}
            >
              Edit
            </Button>
            <Button
              variant="additional"
              size="small"
              disabled={busy}
              onClick={() => update({ is_locked: !comment.is_locked })}
            >
              {comment.is_locked ? 'Unlock' : 'Lock'}
            </Button>
            <DeleteButton
              label="comment"
              onDelete={async () => {
                await commentsApi.remove(comment.id)
                onDelete(comment.id)
              }}
            />
          </>
        )}
      </div>
    </article>
  )
}
