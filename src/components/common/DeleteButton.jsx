import { useState } from 'react'
import Modal from './Modal'
import Button from '../Button/Button'
import InformationMessage from '../InformationMessage/InformationMessage'
import s from './Content.module.scss'

export default function DeleteButton({ label, onDelete }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setBusy(true)
    setError('')
    try {
      await onDelete()
      setOpen(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Button
        variant="additional"
        size="small"
        className={s.danger}
        onClick={() => {
          setError('')
          setOpen(true)
        }}
      >
        Delete
      </Button>
      <Modal
        isOpen={open}
        onClose={() => {
          if (!busy) setOpen(false)
        }}
        ariaLabel={`Delete ${label}`}
      >
        <h2 className={s.title}>Delete this {label}?</h2>
        <p className={s.muted}>This action cannot be undone.</p>
        {error && <InformationMessage type="error" description={error} />}
        <div className={s.actions}>
          <Button variant="primary-black" loading={busy} onClick={handleDelete}>
            Delete
          </Button>
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </>
  )
}
