INSERT INTO DbLike
    (id, author_id, publish_date, post_id, comment_id, type)
VALUES
    -- on posts
    (1, 3, NOW(), 1, NULL, 'like'),
    (2, 4, NOW(), 1, NULL, 'like'),
    (3, 5, NOW(), 2, NULL, 'dislike'),
    (4, 2, NOW(), 3, NULL, 'like'),
    (5, 3, NOW(), 4, NULL, 'like'),

    -- on comments
    (6, 2, NOW(), NULL, 1, 'like'),
    (7, 5, NOW(), NULL, 1, 'like'),
    (8, 3, NOW(), NULL, 2, 'dislike'),
    (9, 4, NOW(), NULL, 3, 'like'),
    (10, 5, NOW(), NULL, 4, 'like')
ON DUPLICATE KEY UPDATE id = id;
