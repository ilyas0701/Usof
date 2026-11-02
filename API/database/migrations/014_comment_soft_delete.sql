ALTER TABLE DbComment ADD COLUMN deleted_by ENUM('user', 'admin') NULL DEFAULT NULL;
