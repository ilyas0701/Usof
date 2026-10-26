import { useEffect, useId, useRef, useState } from 'react'
import { postsApi } from '../../api/postsApi'
import { useAuth } from '../../hooks/useAuth'
import { navigate } from '../../utils/navigation'
import SearchIcon from '../icons/SearchIcon'
import FloatingAccountPanel from './FloatingAccountPanel'
import s from './HeaderSearch.module.scss'

export default function HeaderSearch({ initialQuery = '' }) {
  const { token } = useAuth()
  const [query, setQuery] = useState(initialQuery)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [result, setResult] = useState({ query: '', posts: [], error: '' })
  const anchor = useRef(null)
  const panel = useRef(null)
  const listId = useId()
  const term = query.trim()
  const current = result.query === term
  const posts = current ? result.posts : []
  const visible = open && Boolean(term)

  useEffect(() => {
    if (!term || !open) return
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        const data = await postsApi.search({ q: term, pageSize: 5, sort: 'relevance', status: 'active' }, controller.signal)
        if (!controller.signal.aborted) setResult({ query: term, posts: data.posts, error: '' })
      } catch (error) {
        if (!controller.signal.aborted) setResult({ query: term, posts: [], error: error.message })
      }
    }, 250)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [term, open, token])

  useEffect(() => {
    const closeOutside = (event) => {
      if (!anchor.current?.contains(event.target) && !panel.current?.contains(event.target)) setOpen(false)
    }
    const closeOnNavigate = () => setOpen(false)
    document.addEventListener('pointerdown', closeOutside)
    window.addEventListener('popstate', closeOnNavigate)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      window.removeEventListener('popstate', closeOnNavigate)
    }
  }, [])

  const allResults = () => {
    setOpen(false)
    navigate(term ? `/?q=${encodeURIComponent(term)}` : '/')
  }
  const select = (post) => { setOpen(false); navigate(`/posts/${post.id}`) }

  return (
    <form ref={anchor} className={s.search} role="search" onSubmit={(event) => {
      event.preventDefault()
      if (visible && active >= 0 && posts[active]) select(posts[active])
      else allResults()
    }} onBlur={(event) => {
      if (!anchor.current?.contains(event.relatedTarget) && !panel.current?.contains(event.relatedTarget)) setOpen(false)
    }}>
      <button type="submit" className={s.submit} aria-label="Search questions"><SearchIcon width={18} height={18} /></button>
      <input type="search" className={s.input} role="combobox" aria-label="Search questions" aria-autocomplete="list" aria-expanded={visible} aria-controls={visible ? listId : undefined} aria-activedescendant={visible && posts[active] ? `${listId}-${active}` : undefined} autoComplete="off" placeholder="Search questions..." maxLength={100} value={query}
        onFocus={() => setOpen(true)}
        onChange={(event) => { setQuery(event.target.value); setActive(-1); setOpen(true) }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') { event.preventDefault(); setOpen(false); setActive(-1) }
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            setOpen(true)
            setActive((index) => posts.length ? (index + (event.key === 'ArrowDown' ? 1 : -1) + posts.length) % posts.length : -1)
          }
        }}
      />
      {visible && <FloatingAccountPanel anchorRef={anchor}>
        <div ref={panel} className={s.dropdown} onMouseDown={(event) => event.preventDefault()}>
          <div id={listId} role="listbox" aria-label="Matching questions">
            {posts.map((post, index) => <div key={post.id} id={`${listId}-${index}`} role="option" aria-selected={index === active} className={`${s.option} ${index === active ? s.selected : ''}`} onMouseEnter={() => setActive(index)} onClick={() => select(post)}>
              <span className={s.optionTitle}>{post.title}</span>
            </div>)}
          </div>
          {!current && <p className={s.message} role="status">Searching…</p>}
          {current && result.error && <p className={s.message} role="alert">{result.error}</p>}
          {current && !result.error && !posts.length && <p className={s.message} role="status">No questions found.</p>}
          {posts.length > 0 && <button type="button" className={s.allResults} onClick={allResults}>View all results</button>}
        </div>
      </FloatingAccountPanel>}
    </form>
  )
}
