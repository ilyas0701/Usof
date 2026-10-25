CREATE TABLE DbPostSubscription (
    user_id BIGINT NOT NULL,
    post_id BIGINT NOT NULL,
    subscribed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, post_id),

    FOREIGN KEY (user_id)
        REFERENCES DbUser(id)
        ON DELETE CASCADE,

    FOREIGN KEY (post_id)
        REFERENCES DbPost(id)
        ON DELETE CASCADE
);
