CREATE TABLE DbLike (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    author_id BIGINT NOT NULL,
    publish_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    post_id BIGINT NULL,
    comment_id BIGINT NULL,

    type ENUM('like', 'dislike') NOT NULL,

    UNIQUE KEY unique_post_like (author_id, post_id),
    UNIQUE KEY unique_comment_like (author_id, comment_id),

    FOREIGN KEY (author_id)
        REFERENCES DbUser(id)
        ON DELETE CASCADE,

    FOREIGN KEY (post_id)
        REFERENCES DbPost(id)
        ON DELETE CASCADE,

    FOREIGN KEY (comment_id)
        REFERENCES DbComment(id)
        ON DELETE CASCADE,

    CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL)
        OR
        (post_id IS NULL AND comment_id IS NOT NULL)
    )
);
