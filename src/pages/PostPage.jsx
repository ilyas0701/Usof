import { useCallback, useRef, useState } from 'react'
import { postsApi, commentsApi, reactionsApi } from '../api/postsApi'
import { loadMembership } from '../api/postData'
import { usersApi } from '../api/usersApi'
import { useAuth } from '../hooks/useAuth'
import useResource from '../hooks/useResource'
import usePostEvents from '../hooks/usePostEvents'
import { followLink, navigate, openLogin } from '../utils/navigation'
import { formatDate, validateImages } from '../utils/format'
import { commentThreads } from '../utils/commentThreads'
import PageLayout from '../components/common/PageLayout'
import ResourceState from '../components/common/ResourceState'
import DeleteButton from '../components/common/DeleteButton'
import Reactions from '../components/common/Reactions'
import CommentItem from '../components/posts/CommentItem'
import PostImage from '../components/posts/PostImage'
import Button from '../components/Button/Button'
import InformationMessage from '../components/InformationMessage/InformationMessage'
import s from '../components/common/Content.module.scss'

export default function PostPage({ id, commentId }) {
  const { user, token, isAuthenticated } = useAuth()
  const [content, setContent] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const replyInputRef = useRef(null)
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const detail = useResource(
    useCallback(
      async (signal) => {
        const focused = commentId
          ? await commentsApi.get(commentId, signal)
          : null
        const postId = focused?.post_id || id
        const [post, categories, comments, images, likes, users] =
          await Promise.all([
            postsApi.get(postId, signal),
            postsApi.categories(postId, signal),
            postsApi.comments(postId, signal),
            postsApi.images(postId, signal),
            reactionsApi.list('posts', postId, signal),
            token ? usersApi.list(signal) : Promise.resolve([]),
          ])
        if (
          focused &&
          !comments.some((comment) => String(comment.id) === String(focused.id))
        )
          comments.push(focused)
        const withLikes = await Promise.all(
          comments.map(async (comment) => ({
            ...comment,
            likes: await reactionsApi.list('comments', comment.id, signal),
          })),
        )
        return { post, categories, comments: withLikes, images, likes, users }
      },
      [id, commentId, token],
    ),
  )
  const postId = detail.data?.post.id
  usePostEvents(postId, token, async (signal) => {
    try {
      const [post, comments, users] = await Promise.all([
        postsApi.get(postId, signal),
        postsApi.comments(postId, signal),
        token ? usersApi.list(signal) : Promise.resolve([]),
      ])
      const withLikes = await Promise.all(
        comments.map(async (comment) => ({
          ...comment,
          likes: await reactionsApi.list('comments', comment.id, signal),
        })),
      )
      if (!signal.aborted) {
        detail.setData(
          (current) =>
            current && { ...current, post, comments: withLikes, users },
        )
      }
    } catch (error) {
      if ([403, 404].includes(error.status)) detail.reload()
      throw error
    }
  })
  const membership = useResource(
    useCallback(
      (signal) =>
        token && postId
          ? loadMembership(postId, signal)
          : Promise.resolve({ favorite: false, subscribed: false }),
      [postId, token],
    ),
  )

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
      const comment = await postsApi.comment(postId, content.trim(), replyTo)
      detail.setData((current) => ({
        ...current,
        comments: current.comments.some((item) => item.id === comment.id)
          ? current.comments
          : [...current.comments, { ...comment, likes: [] }],
      }))
      setContent('')
      setReplyTo(null)
    })
  }
  const uploadImages = (event) => {
    event.preventDefault()
    const validation = files.length
      ? validateImages(files)
      : 'Choose at least one image.'
    if (validation) return setError(validation)
    const form = event.currentTarget
    run('images', async () => {
      const images = await postsApi.uploadImages(postId, files)
      detail.setData((current) => ({ ...current, images }))
      setFiles([])
      form.reset()
    })
  }
  const data = detail.data
  const usersById = new Map(
    data?.users.map((author) => [String(author.id), author]),
  )
  const replyTarget = data?.comments.find(
    (comment) => String(comment.id) === String(replyTo),
  )
  const replyUnavailable =
    replyTo != null &&
    (!replyTarget ||
      (user?.role !== 'admin' &&
        (replyTarget.is_locked || replyTarget.status !== 'active')))
  const replyAuthor = usersById.get(String(replyTarget?.author_id))
  const commentsById = new Map(
    data?.comments.map((comment) => [String(comment.id), comment]),
  )
  const isOwner = data && String(user?.userId) === String(data.post.author_id)
  const canInteract =
    data &&
    (user?.role === 'admin' ||
      (!data.post.is_locked && data.post.status === 'active'))

  return (
    <PageLayout title="Question">
      <ResourceState
        loading={detail.loading}
        error={detail.error}
        onRetry={detail.reload}
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
                  #{category.title}
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
            </div>
            {isAuthenticated && (
              <ResourceState
                error={membership.error}
                onRetry={membership.reload}
              />
            )}
            {isOwner && (
              <div className={s.actions}>
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
          </article>
          {isOwner && (
            <form className={`${s.card} ${s.form}`} onSubmit={uploadImages}>
              <label className={s.label}>
                Add images
                <span className={s.muted}>
                  Up to 5 images, 5 MB each. JPEG, PNG, WebP or GIF.
                </span>
                <input
                  className={s.file}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  disabled={Boolean(busy)}
                  onChange={(event) => setFiles(Array.from(event.target.files))}
                />
              </label>
              <div className={s.actions}>
                <Button
                  type="submit"
                  variant="secondary"
                  size="small"
                  loading={busy === 'images'}
                  disabled={Boolean(busy) || !files.length}
                >
                  Upload images
                </Button>
              </div>
            </form>
          )}
          <section id="comments" className={s.card}>
            <h2 className={s.title}>Replies · {data.comments.length}</h2>
            {canInteract ? (
              isAuthenticated ? (
                <form className={s.form} onSubmit={submitComment}>
                  {replyTo != null && (
                    <div className={s.replyContext}>
                      <div className={s.actions}>
                        <span className={s.muted}>
                          {replyUnavailable
                            ? 'This comment is no longer available for replies.'
                            : `Replying to ${replyAuthor ? `@${replyAuthor.login}` : `User #${replyTarget.author_id}`}`}
                        </span>
                        <Button
                          variant="additional"
                          size="small"
                          onClick={() => setReplyTo(null)}
                        >
                          Cancel reply
                        </Button>
                      </div>
                      {replyTarget && (
                        <span>
                          {replyTarget.content.slice(0, 140)}
                          {replyTarget.content.length > 140 ? '…' : ''}
                        </span>
                      )}
                    </div>
                  )}
                  <label className={s.label}>
                    Your reply
                    <textarea
                      ref={replyInputRef}
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
                      disabled={Boolean(busy) || replyUnavailable}
                    >
                      {replyTo != null ? 'Send reply' : 'Post reply'}
                    </Button>
                  </div>
                </form>
              ) : (
                <Button variant="secondary" size="small" onClick={openLogin}>
                  Log in to reply
                </Button>
              )
            ) : (
              <p className={s.muted}>
                This question is closed for new replies and reactions.
              </p>
            )}
            {commentThreads(data.comments).map(({ comment, depth }) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                depth={depth}
                parent={commentsById.get(String(comment.parent_id))}
                parentAuthor={usersById.get(
                  String(
                    commentsById.get(String(comment.parent_id))?.author_id,
                  ),
                )}
                onReply={(target) => {
                  if (!isAuthenticated) return openLogin()
                  setReplyTo(target.id)
                  replyInputRef.current?.focus({ preventScroll: true })
                  replyInputRef.current?.scrollIntoView({ block: 'center' })
                }}
                post={data.post}
                author={usersById.get(String(comment.author_id))}
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
            {!data.comments.length && (
              <p className={s.muted}>Be the first to reply.</p>
            )}
          </section>
        </>
      )}
    </PageLayout>
  )
}
