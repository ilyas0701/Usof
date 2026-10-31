import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { questionIdFromPath, questionPath } from '../../shared/questionUrls'
import { postsApi } from '../api/postsApi'
import { useAuth } from '../hooks/useAuth'
import useApiResource from '../hooks/useApiResource'
import usePostEvents from '../hooks/usePostEvents'
import { followLink, navigate, openLogin } from '../utils/navigation'
import { formatDate } from '../utils/format'
import { commentThreads } from '../utils/commentThreads'
import PageLayout from '../components/common/PageLayout'
import ResourceState from '../components/common/ResourceState'
import DeleteButton from '../components/common/DeleteButton'
import Reactions from '../components/common/Reactions'
import CommentItem from '../components/posts/CommentItem'
import PostImage from '../components/posts/PostImage'
import Button from '../components/Button/Button'
import InformationMessage from '../components/InformationMessage/InformationMessage'
import ShareIcon from '../components/icons/ShareIcon'
import s from '../components/common/Content.module.scss'
import cardStyles from '../components/home/QuestionCard.module.scss'

export default function PostPage({ id, commentId }) {
  const { user, token, isAuthenticated } = useAuth()
  const [content, setContent] = useState('')
  const [commentSort, setCommentSort] = useState('likes-asc')
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [shareMessage, setShareMessage] = useState('')

  useEffect(() => {
    if (!shareMessage) return
    const timeout = window.setTimeout(() => setShareMessage(''), 3000)
    return () => window.clearTimeout(timeout)
  }, [shareMessage])
  const focused = useApiResource(`/comments/${commentId}`, { skip: !commentId })
  const resolvedId = commentId ? focused.data?.post_id : id
  const detail = useApiResource(`/posts/${resolvedId}/details`, { skip: !resolvedId })
  const postId = detail.data?.post.id
  const postTitle = detail.data?.post.title

  useEffect(() => {
    if (!postId || questionIdFromPath(window.location.pathname) !== String(postId)) return
    const canonical = questionPath(postId, postTitle)
    if (window.location.pathname !== canonical) {
      window.history.replaceState(window.history.state, '', canonical + window.location.search + window.location.hash)
    }
  }, [postId, postTitle])
  usePostEvents(postId, token, () => detail.reload())
  const isOwnPost = detail.data && String(user?.userId) === String(detail.data.post.author_id)
  const membership = useApiResource(`/posts/${postId}/membership`, { skip: !token || !postId || isOwnPost })

  const run = async (action, task) => {
    if (!isAuthenticated) return openLogin()
    if (busy) return
    setBusy(action)
    setError('')
    try {
      await task()
    } catch (err) {
      setError(err.message)
      if (
        (action === 'favorite' || action === 'subscribed') &&
        (err.status === 409 || err.status === 404)
      )
        membership.reload()
    } finally {
      setBusy('')
    }
  }

  const toggleMembership = (key) =>
    run(key, async () => {
      const enabled = !membership.data[key]
      await (key === 'favorite' ? postsApi.favorite : postsApi.subscribe)(
        postId,
        enabled,
      )
      membership.setData((current) => ({ ...current, [key]: enabled }))
    })

  const submitComment = (event) => {
    event.preventDefault()
    run('comment', async () => {
      const comment = await postsApi.comment(postId, content.trim())
      detail.setData((current) => ({
        ...current,
        comments: current.comments.some((item) => item.id === comment.id)
          ? current.comments
          : [...current.comments, { ...comment, likes: [] }],
      }))
      setContent('')
    })
  }
  const data = detail.data

  const handleShare = async () => {
    if (!data) return
    setShareMessage('')
    const url = new URL(questionPath(data.post.id, data.post.title), window.location.origin).href
    try {
      if (navigator.share) await navigator.share({ title: data.post.title, url })
      else {
        await navigator.clipboard.writeText(url)
        setShareMessage('Link copied')
      }
    } catch (error) {
      if (error.name !== 'AbortError') setShareMessage('Could not share this question.')
    }
  }
  const isOwner = data && String(user?.userId) === String(data.post.author_id)
  const canInteract =
    data &&
    (user?.role === 'admin' ||
      (!data.post.is_locked && data.post.status === 'active'))

  return (
    <PageLayout title="Question">
      <ResourceState
        loading={detail.loading || focused.loading}
        error={focused.error || detail.error}
        onRetry={focused.error ? focused.reload : detail.reload}
      />
      {data && (
        <>
          <article className={s.card}>
            <div className={s.meta}>
              {data.post.author_id ? (
                <a
                  href={`/users/${data.post.author_id}`}
                  onClick={(event) =>
                    followLink(event, `/users/${data.post.author_id}`)
                  }
                >
                  @{data.post.author_login}
                </a>
              ) : (
                <span>removed</span>
              )}
              <time dateTime={data.post.publish_date}>
                {formatDate(data.post.publish_date)}
              </time>
              {Boolean(data.post.is_locked) && <span>Locked</span>}
              {data.post.status === 'inactive' && <span>Inactive</span>}
            </div>
            <h1 className={s.title}>{data.post.title}</h1>
            <p className={s.text}>{data.post.content}</p>
            <div className={s.tags}>
              {data.categories.map((category) => (
                <a
                  key={category.id}
                  className={s.tag}
                  href={`/categories/${category.id}`}
                  onClick={(event) =>
                    followLink(event, `/categories/${category.id}`)
                  }
                >
                  {category.title}
                </a>
              ))}
            </div>
            <div className={s.images}>
              {data.images.map((image, index) => (
                <PostImage
                  key={image.id}
                  postId={postId}
                  image={image}
                  index={index}
                />
              ))}
            </div>
            {error && <InformationMessage type="error" description={error} />}
            <div className={s.actions}>
              <Reactions
                resource="posts"
                id={postId}
                initialLikes={data.likes}
                disabled={!canInteract}
              />
              <Button variant="secondary" size="small" icon={<ShareIcon width={18} height={18} />} onClick={handleShare}>Share</Button>
              {!isOwner && <>
              <Button
                variant="secondary"
                size="small"
                disabled={
                  Boolean(busy) || (isAuthenticated && !membership.data)
                }
                onClick={() =>
                  isAuthenticated ? toggleMembership('favorite') : openLogin()
                }
              >
                {membership.data?.favorite
                  ? 'Remove favorite'
                  : 'Save question'}
              </Button>
              <Button
                variant="secondary"
                size="small"
                disabled={
                  Boolean(busy) || (isAuthenticated && !membership.data)
                }
                onClick={() =>
                  isAuthenticated ? toggleMembership('subscribed') : openLogin()
                }
              >
                {membership.data?.subscribed ? 'Unfollow' : 'Follow by email'}
              </Button>
              </>}
            </div>
            {shareMessage && createPortal(
              <div className={cardStyles.shareToast} role="status">{shareMessage}</div>,
              document.body,
            )}
            {isAuthenticated && !isOwner && (
              <ResourceState
                error={membership.error}
                onRetry={membership.reload}
              />
            )}
          </article>
            {(isOwner || user?.role === 'admin') && (
              <div className={`${s.actions} ${s.postManagementActions}`}>
                <Button
                  variant="additional"
                  size="small"
                  onClick={() => navigate(`/posts/${postId}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  variant="additional"
                  size="small"
                  disabled={Boolean(busy)}
                  onClick={() =>
                    run('lock', async () => {
                      const post = await postsApi.update(postId, {
                        is_locked: !data.post.is_locked,
                      })
                      detail.setData((current) => ({ ...current, post }))
                    })
                  }
                >
                  {data.post.is_locked ? 'Unlock' : 'Lock'}
                </Button>
                <DeleteButton
                  label="question"
                  onDelete={async () => {
                    await postsApi.remove(postId)
                    navigate('/')
                  }}
                />
              </div>
            )}
          <section id="comments" className={s.card}>
            <h2 className={s.title}>Replies {data.comments.length}</h2>
            <label className={`${s.label} ${s.replySort}`}>
              Sort replies
              <select className={s.select} value={commentSort} onChange={(event) => setCommentSort(event.target.value)}>
                <option value="likes-asc">Fewest likes first</option>
                <option value="likes-desc">Most liked first</option>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </label>
            {canInteract ? (
              isAuthenticated ? (
                <form className={`${s.form} ${s.replyForm}`} onSubmit={submitComment}>
                  <label className={s.label}>
                    Your reply
                    <textarea
                      className={`${s.textarea} ${s.smallTextarea}`}
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                      required
                      maxLength={65535}
                      disabled={Boolean(busy)}
                    />
                  </label>
                  <div className={s.actions}>
                    <Button
                      type="submit"
                      variant="primary-black"
                      size="small"
                      loading={busy === 'comment'}
                      disabled={Boolean(busy) || !content.trim()}
                    >
                      Post reply
                    </Button>
                  </div>
                </form>
              ) : (
                <Button variant="secondary" size="small" className={s.replyForm} onClick={openLogin}>
                  Log in to reply
                </Button>
              )
            ) : (
              <p className={s.muted}>
                This question is closed for new replies and reactions.
              </p>
            )}
            {commentThreads(data.comments, commentSort).map(({ comment, depth }, index, threads) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                depth={depth}
                nextDepth={threads[index + 1]?.depth || 0}
                onReplyCreated={(reply) => detail.setData((current) => ({
                  ...current,
                  comments: current.comments.some((item) => String(item.id) === String(reply.id))
                    ? current.comments
                    : [...current.comments, { ...reply, likes: [] }],
                }))}
                post={data.post}
                onUpdate={(updated) =>
                  detail.setData((current) => ({
                    ...current,
                    comments: current.comments.map((item) =>
                      item.id === updated.id ? updated : item,
                    ),
                  }))
                }
                onDelete={(id) =>
                  detail.setData((current) => ({
                    ...current,
                    comments: current.comments
                      .filter((item) => item.id !== id)
                      .map((item) =>
                        String(item.parent_id) === String(id)
                          ? { ...item, parent_id: null }
                          : item,
                      ),
                  }))
                }
              />
            ))}
          </section>
        </>
      )}
    </PageLayout>
  )
}

