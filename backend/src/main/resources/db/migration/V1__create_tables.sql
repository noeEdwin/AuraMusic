CREATE TABLE rols (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_rols
        FOREIGN KEY (role_id) REFERENCES rols(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE artists (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL UNIQUE,
    bio TEXT,
    image_url VARCHAR(500),
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE albums (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    artist_id BIGINT NOT NULL,
    title VARCHAR(160) NOT NULL,
    cover_url VARCHAR(500),
    release_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_albums_artists
        FOREIGN KEY (artist_id) REFERENCES artists(id),
    CONSTRAINT uq_albums_artist_title
        UNIQUE (artist_id, title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE songs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    artist_id BIGINT NOT NULL,
    album_id BIGINT,
    title VARCHAR(160) NOT NULL,
    duration_seconds INT NOT NULL,
    genre VARCHAR(80),
    audio_url VARCHAR(500) NOT NULL,
    cover_url VARCHAR(500),
    track_number INT,
    explicit_content BOOLEAN NOT NULL DEFAULT FALSE,
    play_count BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_songs_artists
        FOREIGN KEY (artist_id) REFERENCES artists(id),
    CONSTRAINT fk_songs_albums
        FOREIGN KEY (album_id) REFERENCES albums(id),
    CONSTRAINT ck_songs_duration_positive
        CHECK (duration_seconds > 0),
    CONSTRAINT ck_songs_play_count_non_negative
        CHECK (play_count >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE playlists (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(255),
    cover_url VARCHAR(500),
    public BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_playlists_users
        FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT uq_playlists_user_name
        UNIQUE (user_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE playlist_songs (
    playlist_id BIGINT NOT NULL,
    song_id BIGINT NOT NULL,
    position INT NOT NULL,
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (playlist_id, song_id),
    CONSTRAINT fk_playlist_songs_playlists
        FOREIGN KEY (playlist_id) REFERENCES playlists(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_playlist_songs_songs
        FOREIGN KEY (song_id) REFERENCES songs(id)
        ON DELETE CASCADE,
    CONSTRAINT uq_playlist_songs_position
        UNIQUE (playlist_id, position),
    CONSTRAINT ck_playlist_songs_position_positive
        CHECK (position > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_albums_artist_id ON albums(artist_id);
CREATE INDEX idx_songs_artist_id ON songs(artist_id);
CREATE INDEX idx_songs_album_id ON songs(album_id);
CREATE INDEX idx_playlists_user_id ON playlists(user_id);
CREATE INDEX idx_playlist_songs_song_id ON playlist_songs(song_id);
