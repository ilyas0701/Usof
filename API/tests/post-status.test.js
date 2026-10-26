import test from 'node:test';
import assert from 'node:assert/strict';
import PostModel from '../models/PostModel.js';
import PostService from '../services/PostService.js';

test('creation saves the requested status, defaults to active, and rejects invalid status', async (t) => {
    const statuses = [];
    t.mock.method(PostModel, 'countCategories', async () => 1);
    t.mock.method(PostModel, 'create', async (...args) => { statuses.push(args[4]); return 1; });
    t.mock.method(PostModel, 'findById', async () => ({id: 1}));
    const body = {title: 'Question', content: 'Content', categories: [1]};
    await PostService.create(2, body);
    await PostService.create(2, {...body, status: 'inactive'});
    assert.deepEqual(statuses, ['active', 'inactive']);
    await assert.rejects(PostService.create(2, {...body, status: 'invalid'}), {statusCode: 400});
});

test('owner can change status but another regular user cannot', async (t) => {
    const post = {id: 1, author_id: 2, status: 'active'};
    t.mock.method(PostService, 'findById', async () => post);
    t.mock.method(PostModel, 'findSubscriberEmails', async () => []);
    const update = t.mock.method(PostModel, 'update', async () => {});
    t.mock.method(PostModel, 'findById', async () => ({...post, status: 'inactive'}));
    t.mock.method(PostService, 'notifySubscribers', async () => {});
    const result = await PostService.update(1, {userId: 2, role: 'user'}, {status: 'inactive'});
    assert.equal(result.status, 'inactive');
    assert.deepEqual(update.mock.calls[0].arguments[1], {status: 'inactive'});
    await assert.rejects(PostService.update(1, {userId: 3, role: 'user'}, {status: 'inactive'}), {statusCode: 403});
    await assert.rejects(PostService.update(1, {userId: 2, role: 'user'}, {status: 'invalid'}), {statusCode: 400});
});
