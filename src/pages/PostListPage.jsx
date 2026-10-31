import { useState } from 'react'
import useApiResource from '../hooks/useApiResource'
import { queryString } from '../api/client'
import QuestionCard from '../components/home/QuestionCard'
import PageLayout from '../components/common/PageLayout'
import ResourceState from '../components/common/ResourceState'
import Pagination from '../components/common/Pagination'
import s from '../components/common/Content.module.scss'

export default function PostListPage({ collection, categoryId }) {
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('date')
  const params = queryString({ page, pageSize: 10, sort })
  const category = useApiResource(`/categories/${categoryId}`, { skip: !categoryId })
  const list = useApiResource(categoryId ? `/categories/${categoryId}/posts${params}` : `/posts/${collection}${params}`)

  return (
    <PageLayout
      title={
        category.data?.title ||
        (categoryId
          ? 'Category'
          : collection === 'favorites'
            ? 'Favorites'
            : 'Following')
      }
    >
      {category.data?.description && (
        <p className={s.muted}>{category.data.description}</p>
      )}
      {categoryId && (
        <label className={`${s.label} ${s.categorySortControl}`}>
          Sort questions
          <select
            className={s.select}
            value={sort}
            onChange={(event) => {
              setSort(event.target.value)
              setPage(1)
            }}
          >
            <option value="date">Latest</option>
            <option value="likes">Popular</option>
          </select>
        </label>
      )}
      <ResourceState
        loading={list.loading || category.loading}
        error={list.error || category.error}
        onRetry={() => { list.reload(); if (categoryId) category.reload() }}
      />
      {list.data && (
        <div className={s.card}>
          {list.data.posts.length ? (
            list.data.posts.map((post) => (
              <QuestionCard key={post.id} question={post} />
            ))
          ) : (
            <p className={s.muted}>No questions here yet.</p>
          )}
          <Pagination page={page} total={list.data.total} onChange={setPage} />
        </div>
      )}
    </PageLayout>
  )
}
