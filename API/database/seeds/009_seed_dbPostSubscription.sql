INSERT INTO DbPostSubscription (user_id, post_id)
VALUES
    (1, 1),
    (1, 3),
    (2, 2),
    (3, 3),
    (4, 1),
    (4, 2)
ON DUPLICATE KEY UPDATE user_id = user_id;
