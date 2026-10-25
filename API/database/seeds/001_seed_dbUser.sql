INSERT INTO DbUser
    (id, login, password, full_name, email, rating, role, email_verified)
VALUES
    (1, 'admin', '$2b$10$lp3XlTA97hnsgen5lDiR7ea868gwM58v.1Sjv59b./p8XgbzavDIC', 'Admin Illia', 'admin@gmail.com', 0, 'admin', 1),
    (2, 'john', '$2b$10$lp3XlTA97hnsgen5lDiR7ea868gwM58v.1Sjv59b./p8XgbzavDIC', 'John Smith', 'john@gmail.com', 0, 'user', 1),
    (3, 'alex', '$2b$10$lp3XlTA97hnsgen5lDiR7ea868gwM58v.1Sjv59b./p8XgbzavDIC', 'Alex Brown', 'alex@gmail.com', 0, 'user', 1),
    (4, 'kate', '$2b$10$lp3XlTA97hnsgen5lDiR7ea868gwM58v.1Sjv59b./p8XgbzavDIC', 'Kate Green', 'kate@gmail.com', 0, 'user', 1),
    (5, 'mike', '$2b$10$lp3XlTA97hnsgen5lDiR7ea868gwM58v.1Sjv59b./p8XgbzavDIC', 'Mike White', 'mike@gmail.com', 0, 'user', 0)
ON DUPLICATE KEY UPDATE id = id;
