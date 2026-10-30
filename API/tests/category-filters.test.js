import test from 'node:test';
import assert from 'node:assert/strict';
import PostService from '../services/PostService.js';
import PostModel from '../models/PostModel.js';
import pool from '../database/connection.js';

test('validates category filters and removes duplicate IDs', async (t) => {
    const find = t.mock.method(PostModel, 'findAll', async (params) => params);
    const params = await PostService.findAll({categories: '1,2,1', sort: 'date'});
    assert.deepEqual(params.categoryIds, [1, 2]);
    for (const categories of ['', '1,abc', '0,2', '1,', ['1', '2'], Array(101).fill('1').join(',')]) {
        await assert.rejects(PostService.findAll({categories}), {statusCode: 400});
    }
    assert.equal(find.mock.callCount(), 1);
});

test('matches any selected category using EXISTS so counts and pagination do not duplicate posts', async (t) => {
    const execute = t.mock.method(pool, 'execute', async (sql) => sql.includes('COUNT(*) AS total') ? [[{total: 0}]] : [[]]);
    await PostModel.findAll({page: 2, pageSize: 10, sort: 'likes', categoryIds: [1, 2]});
    const calls = execute.mock.calls;
    for (const {arguments: [sql, values]} of calls) {
        assert.match(sql, /EXISTS .*pc\.category_id IN \(\?, \?\)/);
        assert.match(sql, /p\.status = 'active'/);
        assert.deepEqual(values.slice(0, 2), [1, 2]);
    }
    assert.deepEqual(calls[1].arguments[1], [1, 2, 10, 10]);
});
