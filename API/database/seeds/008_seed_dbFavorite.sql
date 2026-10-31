INSERT INTO DbFavorite (user_id, post_id)
VALUES
    (1, 1),
    (1, 2),
    (2, 2),
    (3, 1),
    (4, 3),
    (4, 4)
ON DUPLICATE KEY UPDATE user_id = user_id;
