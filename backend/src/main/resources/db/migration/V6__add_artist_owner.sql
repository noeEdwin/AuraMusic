ALTER TABLE artists
    ADD COLUMN owner_user_id BIGINT NULL AFTER id,
    DROP INDEX name,
    ADD CONSTRAINT fk_artists_owner_users
        FOREIGN KEY (owner_user_id) REFERENCES users(id)
        ON DELETE SET NULL,
    ADD CONSTRAINT uq_artists_owner_name
        UNIQUE (owner_user_id, name);

CREATE INDEX idx_artists_owner_user_id ON artists(owner_user_id);
