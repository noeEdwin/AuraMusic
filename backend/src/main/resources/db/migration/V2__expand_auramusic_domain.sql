ALTER TABLE users DROP FOREIGN KEY fk_users_rols;

RENAME TABLE rols TO roles;

ALTER TABLE users
    ADD CONSTRAINT fk_users_roles
        FOREIGN KEY (role_id) REFERENCES roles(id);

UPDATE roles
SET name = CASE id
    WHEN 1 THEN 'ADMIN'
    WHEN 2 THEN 'MUSICIAN'
    WHEN 3 THEN 'SOLO'
    ELSE name
END,
description = CASE id
    WHEN 1 THEN 'Administrador con acceso completo a la plataforma'
    WHEN 2 THEN 'Musico integrante de banda con acceso a repertorios compartidos'
    WHEN 3 THEN 'Musico solista con biblioteca y repertorios propios'
    ELSE description
END;

ALTER TABLE songs
    ADD COLUMN owner_user_id BIGINT NULL AFTER artist_id,
    ADD COLUMN lyrics TEXT NULL AFTER title,
    ADD COLUMN original_key VARCHAR(10) NULL AFTER genre,
    ADD COLUMN bpm INT NULL AFTER original_key,
    ADD CONSTRAINT fk_songs_owner_users
        FOREIGN KEY (owner_user_id) REFERENCES users(id)
        ON DELETE SET NULL,
    ADD CONSTRAINT ck_songs_bpm_positive
        CHECK (bpm IS NULL OR bpm > 0);

CREATE TABLE bands (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    leader_user_id BIGINT NOT NULL,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(255),
    invite_code VARCHAR(40) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bands_leader_users
        FOREIGN KEY (leader_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE band_members (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    band_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    instrument VARCHAR(80) NOT NULL,
    member_role VARCHAR(50) NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_band_members_bands
        FOREIGN KEY (band_id) REFERENCES bands(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_band_members_users
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT uq_band_members_band_user
        UNIQUE (band_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE setlists (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    owner_user_id BIGINT NOT NULL,
    band_id BIGINT,
    name VARCHAR(140) NOT NULL,
    description VARCHAR(255),
    event_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_setlists_owner_users
        FOREIGN KEY (owner_user_id) REFERENCES users(id),
    CONSTRAINT fk_setlists_bands
        FOREIGN KEY (band_id) REFERENCES bands(id)
        ON DELETE SET NULL,
    CONSTRAINT uq_setlists_owner_name
        UNIQUE (owner_user_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE setlist_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    setlist_id BIGINT NOT NULL,
    song_id BIGINT NOT NULL,
    position INT NOT NULL,
    transpose_steps INT NOT NULL DEFAULT 0,
    break_seconds INT NOT NULL DEFAULT 0,
    notes VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_setlist_items_setlists
        FOREIGN KEY (setlist_id) REFERENCES setlists(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_setlist_items_songs
        FOREIGN KEY (song_id) REFERENCES songs(id)
        ON DELETE CASCADE,
    CONSTRAINT uq_setlist_items_position
        UNIQUE (setlist_id, position),
    CONSTRAINT ck_setlist_items_position_positive
        CHECK (position > 0),
    CONSTRAINT ck_setlist_items_transpose_range
        CHECK (transpose_steps BETWEEN -12 AND 12),
    CONSTRAINT ck_setlist_items_break_non_negative
        CHECK (break_seconds >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE revoked_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    token_hash VARCHAR(128) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE password_reset_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(128) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_password_reset_tokens_users
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_songs_owner_user_id ON songs(owner_user_id);
CREATE INDEX idx_bands_leader_user_id ON bands(leader_user_id);
CREATE INDEX idx_band_members_user_id ON band_members(user_id);
CREATE INDEX idx_setlists_band_id ON setlists(band_id);
CREATE INDEX idx_setlist_items_song_id ON setlist_items(song_id);
CREATE INDEX idx_revoked_tokens_expires_at ON revoked_tokens(expires_at);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
