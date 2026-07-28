INSERT INTO roles (id, name, description) VALUES
    (1, 'ADMIN', 'Administrador con acceso completo a la plataforma'),
    (2, 'MUSICIAN', 'Musico integrante de banda con acceso a repertorios compartidos'),
    (3, 'SOLO', 'Musico solista con biblioteca y repertorios propios');

INSERT INTO users (id, role_id, username, email, password_hash, display_name, avatar_url, enabled) VALUES
    (1, 1, 'admin.noe', 'admin@auramusic.local', '$2a$10$gHjVfC8g3seYKhccvAADP.4MNg.0j8bvw4NpW.S9H1awRHh6I4Dmm', 'Noe Admin', 'https://images.auramusic.local/avatars/admin-noe.png', TRUE),
    (2, 1, 'admin.ops', 'admin.ops@auramusic.local', '$2a$10$D5QC3XzN5By1xHP8xeIvQepKAsupbPul.krHwVu8mWuHzoLt3ik2G', 'Aura Ops', 'https://images.auramusic.local/avatars/admin-ops.png', TRUE),
    (3, 2, 'luna.vale', 'luna.vale@auramusic.local', '$2a$10$D5QC3XzN5By1xHP8xeIvQepKAsupbPul.krHwVu8mWuHzoLt3ik2G', 'Luna Vale', 'https://images.auramusic.local/avatars/luna-vale.png', TRUE),
    (4, 2, 'neon.river', 'neon.river@auramusic.local', '$2a$10$D5QC3XzN5By1xHP8xeIvQepKAsupbPul.krHwVu8mWuHzoLt3ik2G', 'Neon River', 'https://images.auramusic.local/avatars/neon-river.png', TRUE),
    (5, 2, 'atlas.nova', 'atlas.nova@auramusic.local', '$2a$10$D5QC3XzN5By1xHP8xeIvQepKAsupbPul.krHwVu8mWuHzoLt3ik2G', 'Atlas Nova', 'https://images.auramusic.local/avatars/atlas-nova.png', TRUE),
    (6, 2, 'maya.sol', 'maya.sol@auramusic.local', '$2a$10$D5QC3XzN5By1xHP8xeIvQepKAsupbPul.krHwVu8mWuHzoLt3ik2G', 'Maya Sol', 'https://images.auramusic.local/avatars/maya-sol.png', TRUE),
    (7, 3, 'diego.ui', 'diego.ui@auramusic.local', '$2a$10$D5QC3XzN5By1xHP8xeIvQepKAsupbPul.krHwVu8mWuHzoLt3ik2G', 'Diego UI', 'https://images.auramusic.local/avatars/diego-ui.png', TRUE),
    (8, 3, 'sofia.beats', 'sofia.beats@auramusic.local', '$2a$10$D5QC3XzN5By1xHP8xeIvQepKAsupbPul.krHwVu8mWuHzoLt3ik2G', 'Sofia Beats', 'https://images.auramusic.local/avatars/sofia-beats.png', TRUE),
    (9, 3, 'mateo.mix', 'mateo.mix@auramusic.local', '$2a$10$D5QC3XzN5By1xHP8xeIvQepKAsupbPul.krHwVu8mWuHzoLt3ik2G', 'Mateo Mix', 'https://images.auramusic.local/avatars/mateo-mix.png', TRUE),
    (10, 3, 'valeria.wave', 'valeria.wave@auramusic.local', '$2a$10$D5QC3XzN5By1xHP8xeIvQepKAsupbPul.krHwVu8mWuHzoLt3ik2G', 'Valeria Wave', 'https://images.auramusic.local/avatars/valeria-wave.png', TRUE),
    (11, 3, 'andres.lofi', 'andres.lofi@auramusic.local', '$2a$10$D5QC3XzN5By1xHP8xeIvQepKAsupbPul.krHwVu8mWuHzoLt3ik2G', 'Andres Lofi', 'https://images.auramusic.local/avatars/andres-lofi.png', TRUE),
    (12, 3, 'camila.pop', 'camila.pop@auramusic.local', '$2a$10$D5QC3XzN5By1xHP8xeIvQepKAsupbPul.krHwVu8mWuHzoLt3ik2G', 'Camila Pop', 'https://images.auramusic.local/avatars/camila-pop.png', TRUE);

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

INSERT INTO bands (id, leader_user_id, name, description, invite_code) VALUES
    (1, 3, 'Luna Session Band', 'Banda de apoyo para shows de Luna Vale.', 'LUNA-2026-AURA'),
    (2, 4, 'Neon River Live', 'Formato en vivo de Neon River con musicos invitados.', 'NEON-2026-AURA'),
    (3, 5, 'Atlas Nova Crew', 'Agrupacion indie para repertorios electricos.', 'ATLAS-2026-AURA');

INSERT INTO band_members (id, band_id, user_id, instrument, member_role) VALUES
    (1, 1, 3, 'Voz principal', 'LEADER'),
    (2, 1, 7, 'Guitarra principal', 'MEMBER'),
    (3, 1, 8, 'Teclado', 'MEMBER'),
    (4, 2, 4, 'Sintetizadores', 'LEADER'),
    (5, 2, 9, 'Bateria electronica', 'MEMBER'),
    (6, 2, 10, 'Bajo', 'MEMBER'),
    (7, 3, 5, 'Guitarra ritmica', 'LEADER'),
    (8, 3, 11, 'Bateria', 'MEMBER'),
    (9, 3, 12, 'Coros', 'MEMBER');

INSERT INTO setlists (id, owner_user_id, band_id, name, description, event_date) VALUES
    (1, 3, 1, 'Show Electrico Luna', 'Repertorio principal para concierto nocturno.', '2026-07-29'),
    (2, 4, 2, 'Neon Club Session', 'Set electronico para evento en club.', '2026-08-02'),
    (3, 5, 3, 'Atlas Indie Night', 'Setlist indie rock con pausas cortas.', '2026-08-09'),
    (4, 12, NULL, 'Camila Solo Acustico', 'Repertorio personal de musico solista.', '2026-08-16');
