import { useCallback, useState } from 'react'
import { postsApi } from '../api/postsApi'
import { categoriesApi } from '../api/categoriesApi'
import { useAuth } from '../hooks/useAuth'
import useResource from '../hooks/useResource'
import { navigate } from '../utils/navigation'
import { validateImages } from '../utils/format'
import PageLayout from '../components/common/PageLayout'
import ResourceState from '../components/common/ResourceState'
import TextField from '../components/TextField/TextField'
import Button from '../components/Button/Button'
import InformationMessage from '../components/InformationMessage/InformationMessage'
import s from '../components/common/Content.module.scss'

function PostForm({ post, categories, selectedCategories }) {
  const [availableCategories, setAvailableCategories] = useState(categories)
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [categoryTitle, setCategoryTitle] = useState('')
  const [categoryDescription, setCategoryDescription] = useState('')
  const [categoryBusy, setCategoryBusy] = useState(false)
  const [categoryError, setCategoryError] = useState('')
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

  const createCategory = async () => {
    if (categoryBusy || busy) return
    const name = categoryTitle.trim()
    if (!name) return setCategoryError('Enter a category name.')
    const existing = availableCategories.find(
      (category) => category.title.toLowerCase() === name.toLowerCase(),
    )
    if (existing) {
      setSelected((current) => current.includes(existing.id) ? current : [...current, existing.id])
      setCreatingCategory(false)
      setCategoryTitle('')
      setCategoryDescription('')
      setCategoryError('')
      return
    }
    setCategoryBusy(true)
    setCategoryError('')
    try {
      const category = await categoriesApi.create({
        title: name,
        description: categoryDescription.trim() || null,
      })
      setAvailableCategories((current) => [...current, category])
      setSelected((current) => [...current, category.id])
      setCategoryTitle('')
      setCategoryDescription('')
      setCreatingCategory(false)
    } catch (err) {
      setCategoryError(err.message)
    } finally {
      setCategoryBusy(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (categoryBusy) return
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
        categories: selected,
        status,
      }
      const result = id
        ? await postsApi.update(id, body)
        : await postsApi.create(body)
      id = result.id
      saved = true
      setSavedId(id)
      if (files.length) await postsApi.uploadImages(id, files)
      navigate(`/posts/${id}`)
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
      <fieldset className={s.fieldset} disabled={busy || categoryBusy}>
        <legend>Categories</legend>
        <div className={s.tags}>
          {availableCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={s.tag}
              aria-pressed={selected.includes(category.id)}
              onClick={() =>
                setSelected((current) =>
                  current.includes(category.id)
                    ? current.filter((id) => id !== category.id)
                    : [...current, category.id],
                )
              }
            >
              #{category.title}
            </button>
          ))}
          {!creatingCategory && (
            <button type="button" className={`${s.tag} ${s.createCategory}`} onClick={() => setCreatingCategory(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Create category
            </button>
          )}
        </div>
        {creatingCategory && (
          <div className={s.categoryCreator}>
            <TextField
              label="Category name"
              value={categoryTitle}
              maxLength={255}
              onChange={(event) => setCategoryTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') { event.preventDefault(); createCategory() }
              }}
            />
            <TextField
              label="Description (optional)"
              value={categoryDescription}
              onChange={(event) => setCategoryDescription(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') { event.preventDefault(); createCategory() }
              }}
            />
            {categoryError && <InformationMessage type="error" description={categoryError} />}
            <div className={s.actions}>
              <Button variant="primary-black" size="small" onClick={createCategory} disabled={!categoryTitle.trim()}>
                Create and select
              </Button>
              <Button variant="secondary" size="small" onClick={() => { setCreatingCategory(false); setCategoryError('') }}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </fieldset>
      {categoryBusy && <p className={s.muted} role="status">Creating category…</p>}
      <label className={s.label}>
        Status
        <select className={s.select} value={status} onChange={(event) => setStatus(event.target.value)} disabled={busy}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <span className={s.muted}>Inactive questions are visible only to you and administrators.</span>
      </label>
      <label className={s.label}>
        Add images
        <span className={s.muted}>
          Up to 5 images per upload, 5 MB each. JPEG, PNG, WebP or GIF.
        </span>
        <input
          className={s.file}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={busy}
          onChange={(event) => setFiles(Array.from(event.target.files))}
        />
      </label>
      <div className={s.actions}>
        <Button type="submit" variant="primary-black" loading={busy} disabled={categoryBusy}>
          {savedId ? 'Save changes' : 'Publish question'}
        </Button>
        <Button
          variant="secondary"
          disabled={busy || categoryBusy}
          onClick={() => navigate(savedId ? `/posts/${savedId}` : '/')}
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
        const [categories, post, selectedCategories] = await Promise.all([
          categoriesApi.list(signal),
          id ? postsApi.get(id, signal) : Promise.resolve(null),
          id ? postsApi.categories(id, signal) : Promise.resolve([]),
        ])
        if (post && String(post.author_id) !== String(user.userId))
          throw new Error('Only the author can edit this question.')
        return { categories, post, selectedCategories }
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
