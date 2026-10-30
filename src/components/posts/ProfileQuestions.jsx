import { useCallback, useState } from 'react'
import { postsApi } from '../../api/postsApi'
import { loadPostCard } from '../../api/postData'
import { useAuth } from '../../hooks/useAuth'
import useResource from '../../hooks/useResource'
import QuestionCard from '../home/QuestionCard'
import Pagination from '../common/Pagination'
import ResourceState from '../common/ResourceState'
import s from '../common/Content.module.scss'

const PAGE_SIZE = 10

export default function ProfileQuestions({ authorId, isOwner }) {
  const { token } = useAuth()
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('date')
  const [status, setStatus] = useState('active')
  const questions = useResource(
    useCallback(async (signal) => {
      const result = await postsApi.list({
        author: authorId, page, pageSize: PAGE_SIZE, sort, status,
      }, signal)
      const posts = await Promise.all(result.posts.map((post) => loadPostCard(post, signal)))
      return { ...result, posts }
    }, [authorId, page, sort, status]),
    token,
  )

  return (
    <section className={`${s.card} ${s.form}`} aria-label="User questions">
      <h2 className={s.title}>{isOwner ? 'My posts' : 'Posts'}</h2>
      <div className={s.actions}>
        <label className={s.label}>
          Sort questions
          <select className={s.select} value={sort} onChange={(event) => {
            setSort(event.target.value)
            setPage(1)
          }}>
            <option value="date">Latest first</option>
            <option value="likes">Most liked</option>
          </select>
        </label>
        {isOwner && (
          <label className={s.label}>
            Status
            <select className={s.select} value={status} onChange={(event) => {
              setStatus(event.target.value)
              setPage(1)
            }}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        )}
      </div>
      <ResourceState loading={questions.loading} error={questions.error} onRetry={questions.reload} />
      {questions.data && (
        <>
          <div>
            {questions.data.posts.map((question) => <QuestionCard key={question.id} question={question} onChange={questions.reload} />)}
            {!questions.data.posts.length && (
              <p className={s.muted}>{isOwner ? 'You have no questions with this status yet.' : 'This user has no published questions yet.'}</p>
            )}
          </div>
          <Pagination page={page} total={questions.data.total} pageSize={PAGE_SIZE} onChange={setPage} />
        </>
      )}
    </section>
  )
}
