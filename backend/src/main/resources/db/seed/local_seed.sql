INSERT INTO rols (id, name, description) VALUES
    (1, 'ADMIN', 'Administrador con acceso completo a la plataforma'),
    (2, 'ARTIST', 'Usuario artista que publica albums y canciones'),
    (3, 'LISTENER', 'Usuario oyente que crea playlists y reproduce musica');

INSERT INTO users (id, role_id, username, email, password_hash, display_name, avatar_url, enabled) VALUES
    (1, 1, 'admin.noe', 'admin.noe@auramusic.local', '$2a$10$seedPasswordHashAdminNoe', 'Noe Admin', 'https://images.auramusic.local/avatars/admin-noe.png', TRUE),
    (2, 1, 'admin.ops', 'admin.ops@auramusic.local', '$2a$10$seedPasswordHashAdminOps', 'Aura Ops', 'https://images.auramusic.local/avatars/admin-ops.png', TRUE),
    (3, 2, 'luna.vale', 'luna.vale@auramusic.local', '$2a$10$seedPasswordHashLuna', 'Luna Vale', 'https://images.auramusic.local/avatars/luna-vale.png', TRUE),
    (4, 2, 'neon.river', 'neon.river@auramusic.local', '$2a$10$seedPasswordHashNeon', 'Neon River', 'https://images.auramusic.local/avatars/neon-river.png', TRUE),
    (5, 2, 'atlas.nova', 'atlas.nova@auramusic.local', '$2a$10$seedPasswordHashAtlas', 'Atlas Nova', 'https://images.auramusic.local/avatars/atlas-nova.png', TRUE),
    (6, 2, 'maya.sol', 'maya.sol@auramusic.local', '$2a$10$seedPasswordHashMaya', 'Maya Sol', 'https://images.auramusic.local/avatars/maya-sol.png', TRUE),
    (7, 3, 'diego.ui', 'diego.ui@auramusic.local', '$2a$10$seedPasswordHashDiego', 'Diego UI', 'https://images.auramusic.local/avatars/diego-ui.png', TRUE),
    (8, 3, 'sofia.beats', 'sofia.beats@auramusic.local', '$2a$10$seedPasswordHashSofia', 'Sofia Beats', 'https://images.auramusic.local/avatars/sofia-beats.png', TRUE),
    (9, 3, 'mateo.mix', 'mateo.mix@auramusic.local', '$2a$10$seedPasswordHashMateo', 'Mateo Mix', 'https://images.auramusic.local/avatars/mateo-mix.png', TRUE),
    (10, 3, 'valeria.wave', 'valeria.wave@auramusic.local', '$2a$10$seedPasswordHashValeria', 'Valeria Wave', 'https://images.auramusic.local/avatars/valeria-wave.png', TRUE),
    (11, 3, 'andres.lofi', 'andres.lofi@auramusic.local', '$2a$10$seedPasswordHashAndres', 'Andres Lofi', 'https://images.auramusic.local/avatars/andres-lofi.png', TRUE),
    (12, 3, 'camila.pop', 'camila.pop@auramusic.local', '$2a$10$seedPasswordHashCamila', 'Camila Pop', 'https://images.auramusic.local/avatars/camila-pop.png', TRUE);

INSERT INTO artists (id, name, bio, image_url, verified) VALUES
    (1, 'Luna Vale', 'Cantautora de pop atmosferico con sonidos nocturnos.', 'https://images.auramusic.local/artists/luna-vale.png', TRUE),
    (2, 'Neon River', 'Duo electronico con sintetizadores brillantes y bajos profundos.', 'https://images.auramusic.local/artists/neon-river.png', TRUE),
    (3, 'Atlas Nova', 'Productor de indie rock espacial y texturas analogas.', 'https://images.auramusic.local/artists/atlas-nova.png', TRUE),
    (4, 'Maya Sol', 'Vocalista latina con mezcla de soul, pop y ritmos calidos.', 'https://images.auramusic.local/artists/maya-sol.png', TRUE),
    (5, 'Echo Harbor', 'Proyecto alternativo inspirado en paisajes costeros.', 'https://images.auramusic.local/artists/echo-harbor.png', FALSE),
    (6, 'Velvet North', 'Banda de rock suave con guitarras ambientales.', 'https://images.auramusic.local/artists/velvet-north.png', FALSE),
    (7, 'Solar Kids', 'Colectivo juvenil de dance pop y hooks luminosos.', 'https://images.auramusic.local/artists/solar-kids.png', TRUE),
    (8, 'Midnight Bloom', 'Proyecto dream pop con voces etereas.', 'https://images.auramusic.local/artists/midnight-bloom.png', FALSE),
    (9, 'Rocco Beats', 'Beatmaker urbano enfocado en trap melodico.', 'https://images.auramusic.local/artists/rocco-beats.png', TRUE),
    (10, 'Aurora Fields', 'Compositora de folk moderno y arreglos acusticos.', 'https://images.auramusic.local/artists/aurora-fields.png', FALSE);

INSERT INTO albums (id, artist_id, title, cover_url, release_date) VALUES
    (1, 1, 'Noche Cristal', 'https://images.auramusic.local/albums/noche-cristal.png', '2025-02-14'),
    (2, 2, 'Electric Delta', 'https://images.auramusic.local/albums/electric-delta.png', '2025-03-08'),
    (3, 3, 'Orbita Interior', 'https://images.auramusic.local/albums/orbita-interior.png', '2024-11-22'),
    (4, 4, 'Raiz Dorada', 'https://images.auramusic.local/albums/raiz-dorada.png', '2025-05-01'),
    (5, 5, 'Puerto Invisible', 'https://images.auramusic.local/albums/puerto-invisible.png', '2024-09-18'),
    (6, 6, 'Northern Velvet', 'https://images.auramusic.local/albums/northern-velvet.png', '2025-01-30'),
    (7, 7, 'Solar Club', 'https://images.auramusic.local/albums/solar-club.png', '2025-06-12'),
    (8, 8, 'Bloom After Midnight', 'https://images.auramusic.local/albums/bloom-after-midnight.png', '2024-12-05'),
    (9, 9, 'Beat District', 'https://images.auramusic.local/albums/beat-district.png', '2025-04-19'),
    (10, 10, 'Campos de Aurora', 'https://images.auramusic.local/albums/campos-aurora.png', '2024-10-10');

INSERT INTO songs (id, artist_id, album_id, title, duration_seconds, genre, audio_url, cover_url, track_number, explicit_content, play_count) VALUES
    (1, 1, 1, 'Cristal Azul', 214, 'Pop', 'https://audio.auramusic.local/songs/cristal-azul.mp3', 'https://images.auramusic.local/albums/noche-cristal.png', 1, FALSE, 12450),
    (2, 1, 1, 'Luces en Silencio', 198, 'Pop', 'https://audio.auramusic.local/songs/luces-en-silencio.mp3', 'https://images.auramusic.local/albums/noche-cristal.png', 2, FALSE, 9800),
    (3, 2, 2, 'Delta Neon', 243, 'Electronica', 'https://audio.auramusic.local/songs/delta-neon.mp3', 'https://images.auramusic.local/albums/electric-delta.png', 1, FALSE, 20230),
    (4, 2, 2, 'Circuitos', 226, 'Electronica', 'https://audio.auramusic.local/songs/circuitos.mp3', 'https://images.auramusic.local/albums/electric-delta.png', 2, FALSE, 17590),
    (5, 3, 3, 'Gravedad Cero', 251, 'Indie Rock', 'https://audio.auramusic.local/songs/gravedad-cero.mp3', 'https://images.auramusic.local/albums/orbita-interior.png', 1, FALSE, 8420),
    (6, 3, 3, 'Mapa Lunar', 233, 'Indie Rock', 'https://audio.auramusic.local/songs/mapa-lunar.mp3', 'https://images.auramusic.local/albums/orbita-interior.png', 2, FALSE, 7630),
    (7, 4, 4, 'Sol de Enero', 207, 'Latin Pop', 'https://audio.auramusic.local/songs/sol-de-enero.mp3', 'https://images.auramusic.local/albums/raiz-dorada.png', 1, FALSE, 14320),
    (8, 4, 4, 'Raiz', 219, 'Soul', 'https://audio.auramusic.local/songs/raiz.mp3', 'https://images.auramusic.local/albums/raiz-dorada.png', 2, FALSE, 11110),
    (9, 5, 5, 'Muelle Fantasma', 245, 'Alternative', 'https://audio.auramusic.local/songs/muelle-fantasma.mp3', 'https://images.auramusic.local/albums/puerto-invisible.png', 1, FALSE, 6510),
    (10, 6, 6, 'Soft Thunder', 230, 'Soft Rock', 'https://audio.auramusic.local/songs/soft-thunder.mp3', 'https://images.auramusic.local/albums/northern-velvet.png', 1, FALSE, 7290),
    (11, 7, 7, 'Club Solar', 204, 'Dance Pop', 'https://audio.auramusic.local/songs/club-solar.mp3', 'https://images.auramusic.local/albums/solar-club.png', 1, FALSE, 18880),
    (12, 7, 7, 'Verano Digital', 216, 'Dance Pop', 'https://audio.auramusic.local/songs/verano-digital.mp3', 'https://images.auramusic.local/albums/solar-club.png', 2, FALSE, 15940),
    (13, 8, 8, 'Flor Nocturna', 260, 'Dream Pop', 'https://audio.auramusic.local/songs/flor-nocturna.mp3', 'https://images.auramusic.local/albums/bloom-after-midnight.png', 1, FALSE, 5330),
    (14, 9, 9, 'Distrito Bajo', 192, 'Trap', 'https://audio.auramusic.local/songs/distrito-bajo.mp3', 'https://images.auramusic.local/albums/beat-district.png', 1, TRUE, 22100),
    (15, 10, 10, 'Camino Aurora', 238, 'Folk', 'https://audio.auramusic.local/songs/camino-aurora.mp3', 'https://images.auramusic.local/albums/campos-aurora.png', 1, FALSE, 6890);

INSERT INTO playlists (id, user_id, name, description, cover_url, public) VALUES
    (1, 7, 'Dark Glass Coding', 'Musica para programar interfaces de noche.', 'https://images.auramusic.local/playlists/dark-glass-coding.png', TRUE),
    (2, 8, 'Pop Para La Tarde', 'Canciones ligeras para escuchar despues de clases.', 'https://images.auramusic.local/playlists/pop-tarde.png', TRUE),
    (3, 9, 'Beats En Camino', 'Tracks con ritmo para moverse por la ciudad.', 'https://images.auramusic.local/playlists/beats-camino.png', TRUE),
    (4, 10, 'Aura Chill', 'Sonidos tranquilos para cerrar el dia.', 'https://images.auramusic.local/playlists/aura-chill.png', TRUE),
    (5, 11, 'Lofi Alternativo', 'Mezcla suave de indie, dream pop y folk.', 'https://images.auramusic.local/playlists/lofi-alternativo.png', FALSE),
    (6, 12, 'Hits AuraMusic', 'Seleccion de canciones populares de la plataforma.', 'https://images.auramusic.local/playlists/hits-auramusic.png', TRUE),
    (7, 1, 'Revision QA', 'Playlist de prueba para revisar comportamiento del backend.', 'https://images.auramusic.local/playlists/revision-qa.png', FALSE),
    (8, 2, 'Novedades Staff', 'Canciones destacadas por administradores.', 'https://images.auramusic.local/playlists/novedades-staff.png', TRUE),
    (9, 7, 'Electronic Focus', 'Electronica y dance pop para concentrarse.', 'https://images.auramusic.local/playlists/electronic-focus.png', TRUE),
    (10, 8, 'Domingo Acustico', 'Folk y pop tranquilo para descansar.', 'https://images.auramusic.local/playlists/domingo-acustico.png', TRUE);

INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES
    (1, 3, 1),
    (1, 4, 2),
    (1, 11, 3),
    (2, 1, 1),
    (2, 2, 2),
    (2, 7, 3),
    (3, 14, 1),
    (3, 12, 2),
    (4, 8, 1),
    (4, 13, 2),
    (5, 5, 1),
    (5, 15, 2),
    (6, 3, 1),
    (6, 11, 2),
    (6, 14, 3),
    (7, 1, 1),
    (7, 6, 2),
    (8, 9, 1),
    (8, 10, 2),
    (9, 4, 1),
    (9, 12, 2),
    (10, 15, 1),
    (10, 7, 2);
