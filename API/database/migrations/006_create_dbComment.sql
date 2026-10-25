CREATE TABLE DbComment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    post_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    publish_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    content TEXT NOT NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'inactive',
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,

    FOREIGN KEY (post_id)
        REFERENCES DbPost(id)
        ON DELETE CASCADE,

    FOREIGN KEY (author_id)
        REFERENCES DbUser(id)
        ON DELETE CASCADE
);
