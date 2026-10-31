import { useCallback, useState } from 'react'
import { usersApi } from '../api/usersApi'
import { useAuth } from '../hooks/useAuth'
import useResource from '../hooks/useResource'
import { validateImages } from '../utils/format'
import { navigate } from '../utils/navigation'
import PageLayout from '../components/common/PageLayout'
import ResourceState from '../components/common/ResourceState'
import Button from '../components/Button/Button'
import TextField from '../components/TextField/TextField'
import InformationMessage from '../components/InformationMessage/InformationMessage'
import ProfileQuestions from '../components/posts/ProfileQuestions'
import Tabs from '../components/Tabs/Tabs'
import s from '../components/common/Content.module.scss'

function ProfileForm({ profile, onSaved }) {
  const { updateUser, logoutUser } = useAuth()
  const [form, setForm] = useState({
    login: profile.login,
    full_name: profile.full_name || '',
    email: profile.email,
  })
  const [avatar, setAvatar] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const handleChange = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validation = validateImages(avatar ? [avatar] : [], 1)
    if (validation) return setError(validation)
    setBusy(true)
    setError('')
    setMessage('')
    const formElement = event.currentTarget
    let saved
    try {
      saved = await usersApi.update(profile.id, {
        login: form.login.trim(),
        full_name: form.full_name.trim() || null,
        email: form.email.trim(),
      })
      updateUser(saved)
      onSaved(saved)
      if (avatar) {
        saved = await usersApi.uploadAvatar(avatar)
        updateUser(saved)
        onSaved(saved)
        setAvatar(null)
        formElement.reset()
      }
      if (form.email.trim() !== profile.email) {
        await logoutUser()
        navigate('/?view=auth&mode=login')
        return
      }
      setMessage(
        saved.email_verified
          ? 'Profile saved.'
          : 'Profile saved. Check your email to confirm your address.',
      )
    } catch (err) {
      if (saved && saved.email !== profile.email) {
        await logoutUser()
        navigate('/?view=auth&mode=login')
        return
      }
      setError(
        `${saved ? 'Profile details saved. Avatar upload failed: ' : ''}${err.message}`,
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className={s.form} onSubmit={handleSubmit}>
      <h2 className={s.title}>Edit profile</h2>
      {error && <InformationMessage type="error" description={error} />}
      {message && <InformationMessage type="success" description={message} />}
      <TextField
        label="Username"
        name="login"
        value={form.login}
        onChange={handleChange}
        required
        minLength={3}
        maxLength={255}
        pattern="[a-zA-Z0-9_]{3,255}"
        disabled={busy}
      />
      <TextField
        label="Full name"
        name="full_name"
        value={form.full_name}
        onChange={handleChange}
        maxLength={255}
        disabled={busy}
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        required
        maxLength={255}
        disabled={busy}
      />
      <label className={s.label}>
        Avatar
        <span className={s.muted}>JPEG, PNG, WebP or GIF, up to 5 MB</span>
        <input
          className={s.file}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={busy}
          onChange={(event) => setAvatar(event.target.files[0] || null)}
        />
      </label>
      <div className={s.actions}>
        <Button type="submit" variant="primary-black" loading={busy}>
          Save changes
        </Button>
      </div>
    </form>
  )
}

export default function ProfilePage({ id }) {
  const { user, token, logoutUser } = useAuth()
  const [section, setSection] = useState(() => new URLSearchParams(window.location.search).get('tab') === 'posts' ? 'posts' : 'profile')
  const profile = useResource(
    useCallback((signal) => usersApi.get(id, signal), [id]),
    token,
  )
  const data = profile.data
  const isOwner = String(user?.userId) === String(id)
  return (
    <PageLayout title={isOwner ? 'My profile' : 'Profile'}>
      {isOwner && (
        <Tabs
          tabs={[{ key: 'profile', label: 'My profile' }, { key: 'posts', label: 'My posts' }]}
          activeKey={section}
          onChange={setSection}
        />
      )}
      <ResourceState
        loading={profile.loading}
        error={profile.error}
        onRetry={profile.reload}
      />
      {data && (
        <>
          <div hidden={isOwner && section !== 'profile'}>
          <section className={s.card}>
            <div className={s.profile}>
              {data.profile_picture ? (
                <img
                  className={s.avatar}
                  src={data.profile_picture}
                  alt={`${data.login}'s avatar`}
                />
              ) : (
                <div className={s.avatar}>
                  {data.login.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className={s.title}>@{data.login}</h2>
                <p className={s.muted}>{data.full_name}</p>
                <p className={s.muted}>
                  {data.rating} reputation · {data.role}
                </p>
              </div>
            </div>
            {isOwner && (
              <>
              <p className={s.muted}>
                {data.email} ·{' '}
                {data.email_verified ? 'Email verified' : 'Email not verified'}
              </p>
              <Button variant="danger" size="small" onClick={() => {
                logoutUser()
                navigate('/')
              }}>
                Log out
              </Button>
              </>
            )}
          </section>
          {isOwner && (
            <section className={s.card}>
              <ProfileForm profile={data} onSaved={profile.setData} />
            </section>
          )}
          </div>
          {(!isOwner || section === 'posts') && (
            <ProfileQuestions key={id} authorId={id} isOwner={isOwner} />
          )}
        </>
      )}
    </PageLayout>
  )
}
