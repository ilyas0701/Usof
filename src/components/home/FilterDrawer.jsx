import { useEffect, useRef, useState } from 'react'
import CrossIcon from '../icons/CrossIcon'
import Button from '../Button/Button'
import s from './FilterDrawer.module.scss'

export default function FilterDrawer({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  selectedTags = [],
  onTagSelect,
  popularTags = [],
  onResetFilters,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  status,
  onStatusChange,
  isAuthenticated,
}) {
  const drawerRef = useRef(null)
  const closeRef = useRef(null)
  const [categorySearch, setCategorySearch] = useState('')
  const matchingTags = popularTags.filter((tag) => tag.toLowerCase().includes(categorySearch.trim().replace(/^#/, '').toLowerCase()))

  useEffect(() => {
    if (!isOpen) return

    const previouslyFocused = document.activeElement
    const previousOverflow = document.body.style.overflow
    closeRef.current?.focus()

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
      if (e.key === 'Tab') {
        const elements = drawerRef.current?.querySelectorAll(
          'button:not([disabled]), input, select, a[href]',
        )
        if (!elements?.length) return
        const first = elements[0]
        const last = elements[elements.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      if (previouslyFocused?.isConnected) previouslyFocused.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const hasActiveFilters =
    activeTab !== 'all' ||
    selectedTags.length > 0 ||
    Boolean(dateFrom) ||
    Boolean(dateTo) ||
    status !== 'active'

  return (
    <>
      <div className={s.backdrop} onClick={onClose} aria-hidden="true" />

      <aside
        ref={drawerRef}
        className={s.drawer}
        role="dialog"
        aria-modal="true"
        aria-label="Filter panel"
      >
        <div className={s.header}>
          <h2 className={s.title}>Filters</h2>
          <button
            type="button"
            ref={closeRef}
            className={s.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            <CrossIcon width={20} height={20} fill="currentColor" />
          </button>
        </div>

        <div className={s.body}>
          <div className={s.group}>
            <p className={s.groupLabel}>Sort questions</p>
            <div className={s.tabsCard}>
              <button
                type="button"
                className={`${s.tabButton} ${activeTab === 'all' ? s.tabActive : ''}`}
                onClick={() => onTabChange?.('all')}
              >
                All
              </button>
              <button
                type="button"
                className={`${s.tabButton} ${activeTab === 'popular' ? s.tabActive : ''}`}
                onClick={() => onTabChange?.('popular')}
              >
                Popular
              </button>
              <button
                type="button"
                className={`${s.tabButton} ${activeTab === 'disliked' ? s.tabActive : ''}`}
                onClick={() => onTabChange?.('disliked')}
              >
                Disliked
              </button>
            </div>
          </div>

          <div className={s.group}>
            <p className={s.groupLabel}>Categories</p>
            <div className={s.tagsCard}>
              <input type="search" className={s.categorySearch} aria-label="Search categories" placeholder="Search categories..." value={categorySearch} onChange={(event) => setCategorySearch(event.target.value)} />
              {selectedTags.length > 0 && (
                <div className={s.selectedCategory}>
                  {selectedTags.map((tag) => <button key={tag} type="button" className={`${s.tagPill} ${s.tagActive}`} aria-label={`Clear category ${tag}`} onClick={() => onTagSelect?.(tag)}>
                    #{tag} <span aria-hidden="true">×</span>
                  </button>)}
                </div>
              )}
              <div className={s.tagsGrid}>
                {matchingTags.map((tag) => {
                  const isSelected =
                    selectedTags.some((selected) => selected.toLowerCase() === tag.toLowerCase())
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={`${s.tagPill} ${isSelected ? s.tagActive : ''}`}
                      aria-pressed={isSelected}
                      onClick={() => onTagSelect?.(tag)}
                    >
                      #{tag}
                    </button>
                  )
                })}
              </div>
              {!matchingTags.length && <p className={s.emptyCategories} role="status">No categories found.</p>}
            </div>
          </div>

          <div className={s.group}>
            <p className={s.groupLabel}>Publication date</p>
            <label className={s.dateLabel}>
              From
              <input
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(event) => onDateFromChange(event.target.value)}
              />
            </label>
            <label className={s.dateLabel}>
              To
              <input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(event) => onDateToChange(event.target.value)}
              />
            </label>
          </div>
          {isAuthenticated && (
            <div className={s.group}>
              <label className={s.dateLabel}>
                Status
                <select
                  value={status}
                  onChange={(event) => onStatusChange(event.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">My inactive posts</option>
                </select>
              </label>
            </div>
          )}

        </div>

        <div className={s.footer}>
          {hasActiveFilters && (
            <Button
              variant="secondary"
              size="small"
              onClick={onResetFilters}
              className={s.resetBtn}
            >
              Reset
            </Button>
          )}
          <Button
            variant="primary"
            size="small"
            onClick={onClose}
            className={s.applyBtn}
          >
            Apply
          </Button>
        </div>
      </aside>
    </>
  )
}
