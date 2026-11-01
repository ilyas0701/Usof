CREATE TABLE DbUserInvitation (
    token_hash CHAR(64) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
