INSERT INTO DbPostImage (id, post_id, image_path)
VALUES
    (1, 1, '/uploads/posts/test-image.jpg'),
    (2, 2, '/uploads/posts/test-image.jpg'),
    (3, 3, '/uploads/posts/test-image.jpg'),
    (4, 4, '/uploads/posts/test-image.jpg'),
    (5, 5, '/uploads/posts/test-image.jpg')
ON DUPLICATE KEY UPDATE id = id;
