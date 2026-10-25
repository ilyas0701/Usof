CREATE TABLE DbPostCategory (
    post_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,

    PRIMARY KEY (post_id, category_id),

    FOREIGN KEY (post_id)
        REFERENCES DbPost(id)
        ON DELETE CASCADE,

    FOREIGN KEY (category_id)
        REFERENCES DbCategory(id)
        ON DELETE CASCADE
);