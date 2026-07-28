ALTER TABLE songs
    ADD COLUMN album VARCHAR(160) NULL AFTER owner_user_id;

UPDATE songs s
JOIN albums a ON a.id = s.album_id
SET s.album = a.title;

ALTER TABLE songs
    DROP FOREIGN KEY fk_songs_albums,
    DROP INDEX idx_songs_album_id,
    DROP COLUMN album_id,
    DROP COLUMN audio_url,
    DROP COLUMN cover_url,
    DROP COLUMN track_number;

DROP TABLE albums;
