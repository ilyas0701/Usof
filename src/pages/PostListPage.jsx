import { useCallback, useState } from 'react'
import { postsApi } from '../api/postsApi'
import { categoriesApi } from '../api/categoriesApi'
import { loadPostCard } from '../api/postData'
import { useAuth } from '../hooks/useAuth'
import useResource from '../hooks/useResource'
import QuestionCard from '../components/home/QuestionCard'
import PageLayout from '../components/common/PageLayout'
import ResourceState from '../components/common/ResourceState'
import Pagination from '../components/common/Pagination'
import s from '../components/common/Content.module.scss'

export default function PostListPage({ collection, categoryId }) {
  const { token } = useAuth()
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('date')
  const list = useResource(
    useCallback(
      async (signal) => {
        const params = { page, pageSize: 10, sort }
        const [result, category] = await Promise.all([
          categoryId
            ? categoriesApi.posts(categoryId, params, signal)
            : postsApi[collection](params, signal),
          categoryId
            ? categoriesApi.get(categoryId, signal)
            : Promise.resolve(null),
        ])
        const posts = await Promise.all(
          result.posts.map((post) => loadPostCard(post, signal)),
        )
        return { ...result, posts, category }
      },
      [collection, categoryId, page, sort],
    ),
    token,
  )

  return (
    <PageLayout
      title={
        list.data?.category?.title ||
        (categoryId
          ? 'Category'
          : collection === 'favorites'
            ? 'Favorites'
            : 'Following')
      }
    >
      {list.data?.category?.description && (
        <p className={s.muted}>{list.data.category.description}</p>
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
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
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
