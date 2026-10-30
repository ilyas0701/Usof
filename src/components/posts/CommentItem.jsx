import { useEffect, useRef, useState } from 'react'
import { commentsApi, postsApi } from '../../api/postsApi'
import { useAuth } from '../../hooks/useAuth'
import { followLink, openLogin } from '../../utils/navigation'
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
  depth = 0,
  nextDepth = 0,
  onReplyCreated,
  onUpdate,
  onDelete,
}) {
  const { user, isAuthenticated } = useAuth()
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(comment.content)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [replying, setReplying] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const replyInput = useRef(null)
  useEffect(() => {
    if (replying) replyInput.current?.focus({ preventScroll: true })
  }, [replying])
  const submitReply = async (event) => {
    event.preventDefault()
    if (busy || disabled || !replyContent.trim()) return
    setBusy(true)
    setError('')
    try {
      const reply = await postsApi.comment(post.id, replyContent.trim(), comment.id)
      onReplyCreated(reply)
      setReplyContent('')
      setReplying(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }
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
      className={`${s.comment} ${depth > 0 ? s.nestedComment : ''}`}
      style={{ '--reply-depth': Math.min(depth, 4) }}
    >
      {nextDepth > depth && <span className={s.threadStem} aria-hidden="true" />}
      {Array.from({ length: Math.min(depth, 4) }, (_, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={`${s.threadLine} ${index === Math.min(depth, 4) - 1 ? s.threadElbow : ''} ${index >= Math.min(nextDepth, 4) ? s.threadLineEnd : ''}`}
          style={{ '--line-level': index }}
        />
      ))}
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
          onChange={(likes) => onUpdate({ ...comment, likes })}
          disabled={disabled}
        />
        <Button
          variant="additional"
          size="small"
          disabled={busy || disabled}
          aria-expanded={replying}
          onClick={() => {
            if (!isAuthenticated) return openLogin()
            setEditing(false)
            setReplying((current) => !current)
          }}
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
                setReplying(false)
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
      {replying && (
        <form className={`${s.form} ${s.inlineReplyForm}`} onSubmit={submitReply}>
          <label className={s.label}>
            Your reply
            <textarea
              ref={replyInput}
              className={`${s.textarea} ${s.smallTextarea}`}
              value={replyContent}
              onChange={(event) => setReplyContent(event.target.value)}
              required
              maxLength={65535}
              disabled={busy || disabled}
            />
          </label>
          <div className={s.actions}>
            <Button type="submit" variant="primary-black" size="small" loading={busy} disabled={disabled || !replyContent.trim()}>Send reply</Button>
            <Button variant="secondary" size="small" disabled={busy} onClick={() => setReplying(false)}>Cancel</Button>
          </div>
          {disabled && <p className={s.muted}>This comment is closed for new replies.</p>}
        </form>
      )}
    </article>
  )
}
