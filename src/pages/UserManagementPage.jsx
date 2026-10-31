import { useCallback, useState } from 'react'
import { usersApi } from '../api/usersApi'
import { useAuth } from '../hooks/useAuth'
import useResource from '../hooks/useResource'
import { navigate } from '../utils/navigation'
import PageLayout from '../components/common/PageLayout'
import ResourceState from '../components/common/ResourceState'
import TextField from '../components/TextField/TextField'
import Button from '../components/Button/Button'
import InformationMessage from '../components/InformationMessage/InformationMessage'
import ProfileQuestions from '../components/posts/ProfileQuestions'
import s from '../components/common/Content.module.scss'

function UserEditor({ account, onSaved, onDeleted, onClose }) {
  const { user, updateUser, logoutUser } = useAuth()
  const [login, setLogin] = useState(account.login)
  const [fullName, setFullName] = useState(account.full_name || '')
  const [role, setRole] = useState(account.role)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const sync = (updated) => {
    onSaved(updated)
    if (String(updated.id) === String(user.userId)) updateUser(updated)
  }
  const save = async (event) => {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const updated = await usersApi.update(account.id, {
        login: login.trim(), full_name: fullName.trim() || null,
      })
      onSaved(updated)
      const result = role !== updated.role ? await usersApi.updateRole(account.id, role) : updated
      sync(result)
      setMessage('Changes saved.')
    } catch (error) {
      setError(error.message)
      try { 
        sync(await usersApi.get(account.id)) 
      } 
      catch { 
        
      }
    } finally { setBusy(false) }
  }
  const remove = async () => {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      await usersApi.remove(account.id)
      onDeleted(account.id)
      if (String(account.id) === String(user.userId)) await logoutUser()
    } catch (error) { setError(error.message) }
    finally { setBusy(false) }
  }
  return <form className={`${s.card} ${s.form}`} onSubmit={save}>
    <h2 className={s.title}>Edit user · {account.login}</h2>
    {error && <InformationMessage type="error" description={error} />}
    {message && <p role="status">{message}</p>}
    <TextField label="Login" value={login} onChange={(event) => setLogin(event.target.value)} required minLength={3} maxLength={255} pattern="[a-zA-Z0-9_]{3,255}" disabled={busy} />
    <TextField label="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} maxLength={255} disabled={busy} />
    <label className={s.label}>Role
      <select className={s.select} value={role} onChange={(event) => setRole(event.target.value)} disabled={busy}>
        <option value="user">User</option><option value="admin">Admin</option>
      </select>
    </label>
    <p className={s.muted}>Email: {account.email_verified ? 'Verified' : 'Not verified'} · Reputation: {account.rating}</p>
    <div className={s.actions}>
      <Button type="submit" variant="primary-black" loading={busy} disabled={busy}>Save changes</Button>
      <Button variant="secondary" disabled={busy} onClick={onClose}>Close</Button>
      <Button variant="danger" disabled={busy} onClick={() => setConfirmDelete(true)}>Delete user</Button>
    </div>
    {confirmDelete && <div role="alert" className={s.form}>
      <p>Delete {account.login}? This cannot be undone.</p>
      <div className={s.actions}>
        <Button variant="danger" disabled={busy} onClick={remove}>Confirm deletion</Button>
        <Button variant="secondary" disabled={busy} onClick={() => setConfirmDelete(false)}>Cancel</Button>
      </div>
    </div>}
  </form>
}

function UserManager() {
  const { token } = useAuth()
  const users = useResource(useCallback((signal) => usersApi.list(signal), []), token)
  const [query, setQuery] = useState('')
  const [limit, setLimit] = useState(20)
  const matching = (users.data || []).filter((item) =>
    [item.login, item.full_name, item.email].some((value) => value?.toLowerCase().includes(query.trim().toLowerCase())),
  )
  return <div className={s.form}>
    <TextField label="Search users by login, name or email" value={query} onChange={(event) => { setQuery(event.target.value); setLimit(20) }} />
    <ResourceState loading={users.loading} error={users.error} onRetry={users.reload} />
    {users.data && <>
      <p className={s.muted}>{matching.length} users</p>
      <div className={s.userTableWrapper}>
        <table className={s.userTable} aria-label="Users">
          <thead><tr>
            <th scope="col">Login</th><th scope="col">Email</th><th scope="col">Name</th><th scope="col">Role</th><th scope="col">Actions</th>
          </tr></thead>
          <tbody>
            {matching.slice(0, limit).map((account) => <tr key={account.id}>
              <th scope="row">{account.login}</th>
              <td>{account.email}</td>
              <td>{account.full_name || '—'}</td>
              <td><span className={account.role === 'admin' ? s.adminRole : s.userRole}>{account.role === 'admin' ? 'Admin' : 'User'}</span></td>
              <td><Button variant="secondary" size="small" onClick={() => navigate(`/manage/users/${account.id}/edit`)}>Edit user</Button></td>
            </tr>)}
            {!matching.length && <tr><td colSpan={5}>No users found.</td></tr>}
          </tbody>
        </table>
      </div>
      {matching.length > limit && <Button variant="secondary" onClick={() => setLimit((value) => value + 20)}>Show more</Button>}
    </>}
  </div>
}

function UserEditPage({ id }) {
  const { token } = useAuth()
  const account = useResource(useCallback((signal) => usersApi.get(id, signal), [id]), token)
  return <div className={s.form}>
    <ResourceState loading={account.loading} error={account.error} onRetry={account.reload} />
    {account.data && <UserEditor key={`editor-${id}`} account={account.data}
      onSaved={account.setData}
      onClose={() => navigate('/manage/users')}
      onDeleted={() => navigate('/manage/users', true)} />}
    {account.data && <ProfileQuestions key={`posts-${id}`} authorId={id} isOwner={false} showSort={false} />}
  </div>
}

export default function UserManagementPage({ id }) {
  const { user } = useAuth()
  return <PageLayout title={id ? 'Edit user' : 'Manage users'}>
    {user?.role === 'admin' ? (id ? <UserEditPage id={id} /> : <UserManager />) : <p role="alert">Admin access required.</p>}
  </PageLayout>
}
