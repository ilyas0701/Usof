INSERT INTO DbPostCategory (post_id, category_id)
VALUES
    (1, 1),

    (2, 2),
    (2, 3),

    (3, 2),

    (4, 4),

    (5, 5)
ON DUPLICATE KEY UPDATE post_id = post_id;
