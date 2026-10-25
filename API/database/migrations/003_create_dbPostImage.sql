CREATE TABLE DbPostImage (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    post_id BIGINT NOT NULL,
    image_path VARCHAR(255) NOT NULL,

    FOREIGN KEY (post_id)
        REFERENCES DbPost(id)
        ON DELETE CASCADE
);