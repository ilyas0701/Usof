import test from 'node:test'
import assert from 'node:assert/strict'
import { commentThreads } from './commentThreads.js'

test('keeps nested replies with their parent and preserves sibling order', () => {
  const comments = [
    { id: 1, parent_id: null },
    { id: 2, parent_id: null },
    { id: 3, parent_id: 1 },
    { id: 4, parent_id: 3 },
    { id: 5, parent_id: 1 },
  ]
  assert.deepEqual(
    commentThreads(comments).map(({ comment, depth }) => [comment.id, depth]),
    [
      [1, 0],
      [3, 1],
      [4, 2],
      [5, 1],
      [2, 0],
    ],
  )
})

test('shows replies when the parent is hidden or deleted', () => {
  assert.deepEqual(
    commentThreads([
      { id: 2, parent_id: 1 },
      { id: 3, parent_id: null },
    ]).map(({ comment, depth }) => [comment.id, depth]),
    [
      [2, 0],
      [3, 0],
    ],
  )
})

test('handles deep threads without recursive rendering', () => {
  const comments = Array.from({ length: 10000 }, (_, index) => ({
    id: index + 1,
    parent_id: index || null,
  }))
  const result = commentThreads(comments)
  assert.equal(result.length, comments.length)
  assert.equal(result.at(-1).depth, 9999)
})
