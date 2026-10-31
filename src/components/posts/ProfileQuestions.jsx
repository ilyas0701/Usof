import { useState } from 'react'
import useApiResource from '../../hooks/useApiResource'
import { queryString } from '../../api/client'
import QuestionCard from '../home/QuestionCard'
import Pagination from '../common/Pagination'
import ResourceState from '../common/ResourceState'
import s from '../common/Content.module.scss'
import layout from './ProfileQuestions.module.scss'
import filters from '../home/FilterDrawer.module.scss'

const PAGE_SIZE = 10

export default function ProfileQuestions({ authorId, isOwner, showSort = true }) {
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('date')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [categorySearch, setCategorySearch] = useState('')
  const categories = useApiResource('/categories', { skip: !isOwner })
  const questions = useApiResource(`/posts${queryString({ author: authorId, page, pageSize: PAGE_SIZE, sort, categories: selectedCategories.length ? selectedCategories.join(',') : undefined })}`)

  const matchingCategories = (categories.data || []).filter((item) =>
    item.title.toLowerCase().includes(categorySearch.trim().replace(/^#/, '').toLowerCase()))
  const toggleCategory = (id) => {
    setSelectedCategories((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id])
    setPage(1)
  }

  return (
    <section className={layout.layout} aria-label="User questions">
      {(showSort || isOwner) && <aside className={`${s.card} ${s.form} ${layout.filters}`} aria-label="Post filters">
        <h2 className={s.title}>Filters</h2>
        {showSort && <label className={s.label}>
          Sort questions
          <select className={s.select} value={sort} onChange={(event) => {
            setSort(event.target.value)
            setPage(1)
          }}>
            <option value="date">Latest first</option>
            <option value="likes">Most liked</option>
          </select>
        </label>}
        {isOwner && <div>
          <p className={s.label}>Categories</p>
          <input type="search" className={filters.categorySearch} aria-label="Search categories" placeholder="Search categories..." value={categorySearch} onChange={(event) => setCategorySearch(event.target.value)} />
          {selectedCategories.length > 0 && <div className={filters.selectedCategory}>
            {(categories.data || []).filter((item) => selectedCategories.includes(item.id)).map((item) => (
              <button key={item.id} type="button" className={`${filters.tagPill} ${filters.tagActive}`} aria-label={`Clear category ${item.title}`} onClick={() => toggleCategory(item.id)}>
                {item.title} <span aria-hidden="true">×</span>
              </button>
            ))}
          </div>}
          <div className={filters.tagsGrid}>
            {matchingCategories.map((item) => (
              <button key={item.id} type="button" className={`${filters.tagPill} ${selectedCategories.includes(item.id) ? filters.tagActive : ''}`} aria-pressed={selectedCategories.includes(item.id)} onClick={() => toggleCategory(item.id)}>
                {item.title}
              </button>
            ))}
          </div>
          {categories.data && !matchingCategories.length && <p className={filters.emptyCategories} role="status">No categories found.</p>}
        </div>}
      {isOwner && <ResourceState loading={categories.loading} error={categories.error} onRetry={categories.reload} />}
      </aside>}
      <div className={`${s.card} ${s.form} ${layout.posts}`}>
      <h2 className={s.title}>{isOwner ? 'My posts' : 'Posts'}</h2>
      <ResourceState loading={questions.loading} error={questions.error} onRetry={questions.reload} />
      {questions.data && (
        <>
          <div>
            {questions.data.posts.map((question) => <QuestionCard key={question.id} question={question} />)}
            {!questions.data.posts.length && (
              <p className={s.muted}>{selectedCategories.length ? 'No questions in these categories.' : isOwner ? 'You have no questions yet.' : 'This user has no published questions yet.'}</p>
            )}
          </div>
          <Pagination page={page} total={questions.data.total} pageSize={PAGE_SIZE} onChange={setPage} />
        </>
      )}
      </div>
    </section>
  )
}
