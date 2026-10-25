CREATE TABLE DbPost (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    author_id BIGINT NULL,
    title VARCHAR(255) NOT NULL,
    publish_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    content TEXT NOT NULL,

    FOREIGN KEY (author_id)
        REFERENCES DbUser(id)
        ON DELETE SET NULL
);
