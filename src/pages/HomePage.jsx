import { useCallback, useState, useEffect, useRef } from 'react'
import QuestionCard from '../components/home/QuestionCard'
import FilterDrawer from '../components/home/FilterDrawer'
import Button from '../components/Button/Button'
import FilterIcon from '../components/icons/FilterIcon'
import CrossIcon from '../components/icons/CrossIcon'
import { useAuth } from '../hooks/useAuth'
import s from './HomePage.module.scss'
import { postsApi } from '../api/postsApi'
import { loadPostCard } from '../api/postData'
import { categoriesApi } from '../api/categoriesApi'
import { usersApi } from '../api/usersApi'
import useResource from '../hooks/useResource'
import ResourceState from '../components/common/ResourceState'
import Pagination from '../components/common/Pagination'
import { navigate } from '../utils/navigation'
import AccountMenu from '../components/common/AccountMenu'
import HeaderSearch from '../components/common/HeaderSearch'

export default function HomePage({ onOpenAuth }) {
  const { isAuthenticated, token } = useAuth()
  const searchQuery = new URLSearchParams(window.location.search).get('q') || ''
  const [selectedTag, setSelectedTag] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(1)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [status, setStatus] = useState('active')
  const visibleStatus = isAuthenticated ? status : 'active'
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const categories = useResource(
    useCallback((signal) => categoriesApi.list(signal), []),
  )
  const authors = useResource(
    useCallback(
      (signal) => (token ? usersApi.list(signal) : Promise.resolve([])),
      [token],
    ),
  )
  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedQuery(searchQuery.trim()),
      300,
    )
    return () => window.clearTimeout(timeout)
  }, [searchQuery])
  const feed = useResource(
    useCallback(
      async (signal) => {
        if (!categories.data) return { posts: [], total: 0 }
        const category = categories.data.find(
          (item) => item.title === selectedTag,
        )
        const params = {
          page,
          pageSize: 10,
          sort:
            activeTab === 'popular'
              ? 'likes'
              : debouncedQuery
                ? 'relevance'
                : 'date',
          q: debouncedQuery || undefined,
          dateFrom,
          dateTo,
          status: visibleStatus,
        }
        const result = category
          ? await categoriesApi.posts(category.id, params, signal)
          : await (debouncedQuery ? postsApi.search : postsApi.list)(
              params,
              signal,
            )
        const posts = await Promise.all(
          result.posts.map((post) => loadPostCard(post, signal)),
        )
        return { ...result, posts }
      },
      [
        categories.data,
        debouncedQuery,
        selectedTag,
        activeTab,
        page,
        dateFrom,
        dateTo,
        visibleStatus,
      ],
    ),
    token,
  )
  const changeFilter = (setter) => (value) => {
    setter(value)
    setPage(1)
  }
  const filteredQuestions = feed.data?.posts || []
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const closeFilters = useCallback(() => setIsFilterDrawerOpen(false), [])
  const [headerState, setHeaderState] = useState('normal')
  const headerRef = useRef(null)
  const curvedSectionRef = useRef(null)

  useEffect(() => {
    const updateHeader = () => {
      const sectionTop = curvedSectionRef.current?.getBoundingClientRect().top
      const headerHeight = headerRef.current?.offsetHeight ?? 0
      setHeaderState((current) => {
        if (sectionTop != null && sectionTop <= headerHeight * 0.2)
          return 'fixed'
        if (sectionTop == null || sectionTop >= headerHeight) return 'normal'
        if (current === 'fixed') {
          return window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'normal'
            : 'leaving'
        }
        return current
      })
    }

    updateHeader()
    window.addEventListener('scroll', updateHeader, { passive: true })
    window.addEventListener('resize', updateHeader)

    return () => {
      window.removeEventListener('scroll', updateHeader)
      window.removeEventListener('resize', updateHeader)
    }
  }, [])


  const activeFilterCount =
    (activeTab !== 'all' ? 1 : 0) +
    (selectedTag ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0) +
    (visibleStatus !== 'active' ? 1 : 0)

  const hasActiveFilters = activeFilterCount > 0

  const handleResetFilters = () => {
    setActiveTab('all')
    setSelectedTag(null)
    setDateFrom('')
    setDateTo('')
    setStatus('active')
    setPage(1)
  }

  return (
    <div className={s.page}>
      <header
        ref={headerRef}
        className={`${s.heroHeader} ${headerState === 'fixed' ? s.fixedHeader : ''} ${headerState === 'leaving' ? s.leavingHeader : ''}`}
        onAnimationEnd={(event) => {
          if (
            event.target === event.currentTarget &&
            headerState === 'leaving'
          ) {
            setHeaderState('normal')
          }
        }}
      >
        <div className={s.headerContainer}>
          <a href="#" className={s.logoLink}>
            <span className={s.logoText}>USOF</span>
          </a>
          <HeaderSearch initialQuery={searchQuery} />
          <div className={s.headerRight}>
            {isAuthenticated ? (
              <AccountMenu />
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => onOpenAuth?.('login')}
                >
                  My account
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => onOpenAuth?.('register')}
                >
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <section className={s.heroYellow}>
        <div className={s.heroContent}>
          <h1 className={s.heroHeading}>A place to share your knowledge</h1>

          <div className={s.heroActionLine}>
            <span>Here you can</span>
            <button
              type="button"
              className={s.blackPillBtn}
              onClick={() =>
                isAuthenticated
                  ? navigate('/posts/new')
                  : onOpenAuth?.('register')
              }
            >
              <span>{isAuthenticated ? 'ask a question' : 'join USOF'}</span>
            </button>
            <span>, quickly and easily</span>
          </div>
        </div>
      </section>

      <section ref={curvedSectionRef} className={s.curvedContainer}>
        <div className={s.curvedInner}>
          <div id="questions" className={s.feedLayout}>
            <div className={s.feedControls}>
              <div className={s.searchAndFilterRow}>

                <button
                  type="button"
                  className={`${s.filterButton} ${hasActiveFilters ? s.active : ''}`}
                  onClick={() => setIsFilterDrawerOpen(true)}
                  aria-label="Open filters"
                >
                  <FilterIcon width={18} height={18} />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className={s.filterBadge}>{activeFilterCount}</span>
                  )}
                </button>
              </div>

              {hasActiveFilters && (
                <div className={s.activeFiltersBanner}>
                  <div className={s.activeFiltersGroup}>
                    <span className={s.activeFiltersLabel}>
                      Active filters:
                    </span>

                    {activeTab !== 'all' && (
                      <span className={s.activeFilterChip}>
                        <span>
                          {activeTab === 'popular' ? 'Popular' : 'Unanswered'}
                        </span>
                        <button
                          type="button"
                          className={s.chipRemoveBtn}
                          onClick={() => changeFilter(setActiveTab)('all')}
                          aria-label="Clear sorting"
                        >
                          <CrossIcon width={10} height={10} />
                        </button>
                      </span>
                    )}

                    {selectedTag && (
                      <span className={s.activeFilterChip}>
                        <span>#{selectedTag}</span>
                        <button
                          type="button"
                          className={s.chipRemoveBtn}
                          onClick={() => changeFilter(setSelectedTag)(null)}
                          aria-label="Remove tag filter"
                        >
                          <CrossIcon width={10} height={10} />
                        </button>
                      </span>
                    )}

                    {(dateFrom || dateTo || visibleStatus !== 'active') && (
                      <span className={s.activeFilterChip}>
                        {dateFrom || 'Any date'} — {dateTo || 'Today'} ·{' '}
                        {visibleStatus}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className={s.clearAllBtn}
                    onClick={handleResetFilters}
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            <div className={s.questionList}>
              <ResourceState
                loading={categories.loading || feed.loading}
                error={categories.error || feed.error}
                onRetry={() => {
                  categories.reload()
                  feed.reload()
                }}
              />
              {!categories.loading &&
                !feed.loading &&
                !categories.error &&
                !feed.error &&
                (filteredQuestions.length > 0 ? (
                  filteredQuestions.map((question) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      onTagClick={changeFilter(setSelectedTag)}
                    />
                  ))
                ) : (
                  <div className={s.emptyState}>
                    <p className={s.emptyTitle}>No questions found</p>
                    <p className={s.emptyDesc}>
                      Try another search or clear the filters.
                    </p>
                    {hasActiveFilters && (
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={handleResetFilters}
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                ))}
              {feed.data && (
                <Pagination
                  page={page}
                  total={feed.data.total}
                  onChange={setPage}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={closeFilters}
        activeTab={activeTab}
        onTabChange={changeFilter(setActiveTab)}
        selectedTag={selectedTag}
        onTagSelect={changeFilter(setSelectedTag)}
        popularTags={(categories.data || []).map((category) => category.title)}
        topAuthors={[...(authors.data || [])]
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 5)
          .map((author) => ({
            id: author.id,
            name: author.login,
            rating: author.rating,
          }))}
        onAuthorSelect={(id) => navigate(`/users/${id}`)}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={changeFilter(setDateFrom)}
        onDateToChange={changeFilter(setDateTo)}
        status={visibleStatus}
        onStatusChange={changeFilter(setStatus)}
        isAuthenticated={isAuthenticated}
        onResetFilters={handleResetFilters}
      />
    </div>
  )
}


