ALTER TABLE DbComment
    DROP FOREIGN KEY DbComment_ibfk_2,
    MODIFY author_id BIGINT NULL,
    ADD CONSTRAINT fk_comment_author FOREIGN KEY (author_id) REFERENCES DbUser(id) ON DELETE SET NULL;
