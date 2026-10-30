import { useCallback, useState } from 'react'
import { categoriesApi } from '../api/categoriesApi'
import { useAuth } from '../hooks/useAuth'
import useResource from '../hooks/useResource'
import PageLayout from '../components/common/PageLayout'
import ResourceState from '../components/common/ResourceState'
import TextField from '../components/TextField/TextField'
import Button from '../components/Button/Button'
import InformationMessage from '../components/InformationMessage/InformationMessage'
import s from '../components/common/Content.module.scss'

function CategoryManager() {
  const { token } = useAuth()
  const categories = useResource(useCallback((signal) => categoriesApi.list(signal), []), token)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const create = async (event) => {
    event.preventDefault()
    if (busy || !title.trim()) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await categoriesApi.create({ title: title.trim(), description: description.trim() || null })
      setTitle('')
      setDescription('')
      setMessage('Category created.')
      categories.reload()
    } catch (error) {
      setError(error.message)
    } finally {
      setBusy(false)
    }
  }
  return <>
    <form className={`${s.card} ${s.form}`} onSubmit={create}>
      <h2 className={s.title}>Create category</h2>
      {error && <InformationMessage type="error" description={error} />}
      {message && <p role="status">{message}</p>}
      <TextField label="Category name" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={255} required disabled={busy} />
      <label className={s.label}>Description
        <textarea className={s.textarea} value={description} onChange={(event) => setDescription(event.target.value)} disabled={busy} />
      </label>
      <Button type="submit" variant="primary-black" loading={busy} disabled={busy || !title.trim()}>Create category</Button>
    </form>
    <ResourceState loading={categories.loading} error={categories.error} onRetry={categories.reload} />
    {categories.data && <section className={`${s.card} ${s.form}`} aria-label="Existing categories">
      <h2 className={s.title}>Categories</h2>
      {categories.data.length ? categories.data.map((category) => <div key={category.id}>
        <strong>{category.title}</strong>
        {category.description && <p className={s.muted}>{category.description}</p>}
      </div>) : <p className={s.muted}>No categories yet.</p>}
    </section>}
  </>
}

export default function CategoryManagementPage() {
  const { user } = useAuth()
  return <PageLayout title="Manage categories">
    {user?.role === 'admin' ? <CategoryManager /> : <p role="alert">Admin access required.</p>}
  </PageLayout>
}
