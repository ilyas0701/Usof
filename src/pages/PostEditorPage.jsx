import { useCallback, useRef, useState } from 'react'
import { postsApi } from '../api/postsApi'
import { categoriesApi } from '../api/categoriesApi'
import { useAuth } from '../hooks/useAuth'
import useResource from '../hooks/useResource'
import { navigate } from '../utils/navigation'
import { questionPath } from '../../shared/questionUrls'
import { validateImages } from '../utils/format'
import PageLayout from '../components/common/PageLayout'
import ResourceState from '../components/common/ResourceState'
import TextField from '../components/TextField/TextField'
import Button from '../components/Button/Button'
import InformationMessage from '../components/InformationMessage/InformationMessage'
import PostImage from '../components/posts/PostImage'
import SelectedImagePreview from '../components/posts/SelectedImagePreview'
import s from '../components/common/Content.module.scss'

function PostForm({ post, categories, selectedCategories, images = [] }) {
  const [savedImages, setSavedImages] = useState(images)
  const [removedImages, setRemovedImages] = useState([])
  const fileInput = useRef(null)
  const availableCategories = categories
  const [categoryTitle, setCategoryTitle] = useState('')
  const [title, setTitle] = useState(post?.title || '')
  const [content, setContent] = useState(post?.content || '')
  const [status, setStatus] = useState(post?.status || 'active')
  const [selected, setSelected] = useState(
    selectedCategories.map((category) => category.id),
  )
  const [files, setFiles] = useState([])
  const [savedId, setSavedId] = useState(post?.id)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (busy) return
    const validation =
      !title.trim() || !content.trim()
        ? 'Enter a title and question text.'
        : !selected.length
          ? 'Choose at least one category.'
          : validateImages(files)
    if (validation) return setError(validation)
    setBusy(true)
    setError('')
    let id = savedId
    let saved = false
    try {
      const body = {
        title: title.trim(),
        content: content.trim(),
        categories: [...new Set(selected)],
        status,
      }
      const result = id
        ? await postsApi.update(id, body)
        : await postsApi.create(body)
      id = result.id
      saved = true
      setSavedId(id)
      for (const imageId of removedImages) {
        await postsApi.removeImage(id, imageId)
        setSavedImages((current) => current.filter((image) => image.id !== imageId))
        setRemovedImages((current) => current.filter((item) => item !== imageId))
      }
      if (files.length) await postsApi.uploadImages(id, files)
      navigate(questionPath(id, result.title))
    } catch (err) {
      setError(
        `${saved ? 'Your post is saved. You can retry or open it. ' : ''}${err.message}`,
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className={`${s.card} ${s.form}`} onSubmit={handleSubmit}>
      {error && <InformationMessage type="error" description={error} />}
      <TextField
        label="Question title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
        maxLength={255}
        disabled={busy}
      />
      <label className={s.label}>
        Your question
        <textarea
          className={s.textarea}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          required
          maxLength={65535}
          disabled={busy}
        />
      </label>
      <fieldset className={s.fieldset} disabled={busy}>
        <legend>Categories</legend>
        <div className={s.categorySearchRow}>
          <div className={s.categorySearchField}>
          <TextField
            label="Search categories"
            className={s.categoryInput}
            value={categoryTitle}
            maxLength={255}
            autoComplete="off"
            disabled={busy}
            onChange={(event) => setCategoryTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.preventDefault()
            }}
          />
          <div className={s.categoryTagChoices}>
            <div className={s.tags}>
            {availableCategories.filter((category) => !selected.includes(category.id) && category.title.toLowerCase().includes(categoryTitle.trim().toLowerCase())).sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 30).map((category) => (
              <button type="button" className={s.tag} key={category.id} onClick={() => {
                setSelected((current) => current.includes(category.id) ? current : [...current, category.id])
                setCategoryTitle('')
              }}>{category.title}</button>
            ))}
            </div>
            {!availableCategories.some((category) => !selected.includes(category.id) && category.title.toLowerCase().includes(categoryTitle.trim().toLowerCase())) && (
              <p className={s.muted}>No matching categories.</p>
            )}
          </div>
          </div>
        </div>
        {selected.length > 0 && <div className={s.tags}>
          {availableCategories.filter((category) => selected.includes(category.id)).map((category) => (
            <button type="button" key={category.id} className={s.tag} aria-pressed="true" aria-label={`Remove category ${category.title}`} onClick={() => setSelected((current) => current.filter((id) => id !== category.id))}>
              {category.title} <span aria-hidden="true">×</span>
            </button>
          ))}
        </div>}
      </fieldset>
      <label className={s.label}>
        Status
        <select className={s.select} value={status} onChange={(event) => setStatus(event.target.value)} disabled={busy}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <span className={s.muted}>Inactive questions are visible only to you and administrators.</span>
      </label>
      {post && <label className={s.label}>
        Add images
        <span className={s.muted}>
          Up to 5 images per upload, 5 MB each. JPEG, PNG, WebP or GIF.
        </span>
        <input
          ref={fileInput}
          className={s.file}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={busy}
          onChange={(event) => {
            const selectedFiles = Array.from(event.target.files)
            const validation = validateImages(selectedFiles)
            setError(validation || '')
            setFiles(validation ? [] : selectedFiles)
            if (validation) event.target.value = ''
          }}
        />
      </label>}
      {post && (savedImages.length > 0 || files.length > 0) && (
        <div className={s.attachmentPreviews}>
          {savedImages.length > 0 && (
            <div>
              <p className={s.muted}>Saved images · {savedImages.length - removedImages.length}</p>
              <div className={s.previewGrid}>
                {savedImages.map((image, index) => (
                  <div className={s.previewItem} key={image.id}>
                    <PostImage postId={post.id} image={image} index={index} />
                    {removedImages.includes(image.id) && <p className={s.muted}>Will be deleted when you save</p>}
                    <Button variant={removedImages.includes(image.id) ? 'secondary' : 'danger'} size="small" disabled={busy} onClick={() => setRemovedImages((current) => current.includes(image.id) ? current.filter((id) => id !== image.id) : [...current, image.id])}>
                      {removedImages.includes(image.id) ? 'Undo' : 'Remove'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {files.length > 0 && (
            <div>
              <p className={s.muted}>Selected images · {files.length} — upload when you save</p>
              <div className={s.previewGrid}>
                {files.map((file, index) => (
                  <figure className={s.previewItem} key={`${file.name}-${file.lastModified}-${index}`}>
                    <SelectedImagePreview file={file} />
                    <figcaption>{file.name}</figcaption>
                    <Button variant="danger" size="small" disabled={busy} onClick={() => {
                      const remaining = files.filter((_, fileIndex) => fileIndex !== index)
                      setFiles(remaining)
                      const transfer = new DataTransfer()
                      remaining.forEach((item) => transfer.items.add(item))
                      fileInput.current.files = transfer.files
                    }}>Remove</Button>
                  </figure>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      <div className={s.actions}>
        <Button type="submit" variant="primary-black" loading={busy} disabled={busy}>
          {savedId ? 'Save changes' : 'Publish question'}
        </Button>
        <Button
          variant="secondary"
          disabled={busy}
          onClick={() => navigate(savedId ? questionPath(savedId, post?.title || title) : '/')}
        >
          {savedId ? 'Open question' : 'Cancel'}
        </Button>
      </div>
    </form>
  )
}

export default function PostEditorPage({ id }) {
  const { token, user } = useAuth()
  const editor = useResource(
    useCallback(
      async (signal) => {
        const [categories, post, selectedCategories, images] = await Promise.all([
          categoriesApi.list(signal),
          id ? postsApi.get(id, signal) : Promise.resolve(null),
          id ? postsApi.categories(id, signal) : Promise.resolve([]),
          id ? postsApi.images(id, signal) : Promise.resolve([]),
        ])
        if (post && String(post.author_id) !== String(user.userId))
          throw new Error('Only the author can edit this question.')
        return { categories, post, selectedCategories, images }
      },
      [id, user.userId],
    ),
    token,
  )
  return (
    <PageLayout title={id ? 'Edit question' : 'Ask a question'}>
      <ResourceState
        loading={editor.loading}
        error={editor.error}
        onRetry={editor.reload}
      />
      {editor.data && <PostForm {...editor.data} />}
    </PageLayout>
  )
}
