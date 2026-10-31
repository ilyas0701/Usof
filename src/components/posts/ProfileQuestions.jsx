import { useState } from 'react'
import useApiResource from '../../hooks/useApiResource'
import { queryString } from '../../api/client'
import QuestionCard from '../home/QuestionCard'
import Pagination from '../common/Pagination'
import ResourceState from '../common/ResourceState'
import s from '../common/Content.module.scss'

const PAGE_SIZE = 10

export default function ProfileQuestions({ authorId, isOwner, showSort = true }) {
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('date')
  const questions = useApiResource(`/posts${queryString({ author: authorId, page, pageSize: PAGE_SIZE, sort })}`)

  return (
    <section className={`${s.card} ${s.form}`} aria-label="User questions">
      <h2 className={s.title}>{isOwner ? 'My posts' : 'Posts'}</h2>
      {showSort && <div className={s.actions}>
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
      </div>}
      <ResourceState loading={questions.loading} error={questions.error} onRetry={questions.reload} />
      {questions.data && (
        <>
          <div>
            {questions.data.posts.map((question) => <QuestionCard key={question.id} question={question} />)}
            {!questions.data.posts.length && (
              <p className={s.muted}>{isOwner ? 'You have no questions yet.' : 'This user has no published questions yet.'}</p>
            )}
          </div>
          <Pagination page={page} total={questions.data.total} pageSize={PAGE_SIZE} onChange={setPage} />
        </>
      )}
    </section>
  )
}
