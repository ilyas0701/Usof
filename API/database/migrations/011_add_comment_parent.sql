ALTER TABLE DbComment
    ADD COLUMN parent_id BIGINT NULL AFTER post_id,
    ADD CONSTRAINT fk_comment_parent
        FOREIGN KEY (parent_id) REFERENCES DbComment(id)
        ON DELETE SET NULL;
