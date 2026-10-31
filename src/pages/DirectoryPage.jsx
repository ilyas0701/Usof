import useApiResource from '../hooks/useApiResource'
import { followLink } from '../utils/navigation'
import PageLayout from '../components/common/PageLayout'
import ResourceState from '../components/common/ResourceState'
import s from '../components/common/Content.module.scss'

export default function DirectoryPage() {
  const list = useApiResource('/users')
  const items = [...(list.data || [])].sort((a, b) => b.rating - a.rating)

  return (
    <PageLayout title="Users">
      <ResourceState
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
      />
      <div className={s.grid}>
        {items?.map((item) => {
          const path = `/users/${item.id}`
          return (
            <a
              key={item.id}
              href={path}
              className={`${s.card} ${s.listLink}`}
              onClick={(event) => followLink(event, path)}
            >
              <h2 className={s.title}>
                @{item.login}
              </h2>
              <p className={s.muted}>
                {item.rating} reputation
              </p>
            </a>
          )
        })}
      </div>
      {items?.length === 0 && <p className={s.muted}>Nothing here yet.</p>}
    </PageLayout>
  )
}
