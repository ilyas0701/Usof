import Button from '../Button/Button'
import Loader from '../Loader/Loader'
import InformationMessage from '../InformationMessage/InformationMessage'
import s from './Content.module.scss'

export default function ResourceState({ loading, error, onRetry }) {
  if (loading)
    return (
      <div className={s.state} role="status">
        <Loader />
        <span>Loading...</span>
      </div>
    )
  if (!error) return null
  return (
    <div className={s.state}>
      <InformationMessage type="error" description={error} />
      {onRetry && (
        <Button variant="secondary" size="small" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
