package com.auramusic.backend.catalog;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.auramusic.backend.domain.entity.Artist;
import com.auramusic.backend.repository.ArtistRepository;
import com.auramusic.backend.repository.RoleRepository;
import com.auramusic.backend.repository.SongRepository;
import com.auramusic.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CatalogIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ArtistRepository artistRepository;

    @Autowired
    private SongRepository songRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private Artist seededArtist;

    @BeforeEach
    void setUp() {
        jdbcTemplate.update("DELETE FROM setlist_items");
        jdbcTemplate.update("DELETE FROM setlists");
        jdbcTemplate.update("DELETE FROM playlist_songs");
        jdbcTemplate.update("DELETE FROM playlists");
        jdbcTemplate.update("DELETE FROM band_members");
        jdbcTemplate.update("DELETE FROM bands");
        songRepository.deleteAll();
        artistRepository.deleteAll();
        userRepository.deleteAll();
        roleRepository.deleteAll();

        jdbcTemplate.update("INSERT INTO roles (name, description, created_at) VALUES ('MUSICIAN', 'Musico', CURRENT_TIMESTAMP)");
        jdbcTemplate.update("INSERT INTO roles (name, description, created_at) VALUES ('ADMIN', 'Administrador', CURRENT_TIMESTAMP)");
        Long musicianRoleId = roleRepository.findByName("MUSICIAN").orElseThrow().getId();
        Long adminRoleId = roleRepository.findByName("ADMIN").orElseThrow().getId();

        jdbcTemplate.update("""
                INSERT INTO users (role_id, username, email, password_hash, display_name, enabled, created_at, updated_at)
                VALUES (?, 'musician', 'musician@auramusic.local', '$2a$10$placeholder', 'musician', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, musicianRoleId);
        jdbcTemplate.update("""
                INSERT INTO users (role_id, username, email, password_hash, display_name, enabled, created_at, updated_at)
                VALUES (?, 'bandmate', 'bandmate@auramusic.local', '$2a$10$placeholder', 'bandmate', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, musicianRoleId);
        jdbcTemplate.update("""
                INSERT INTO users (role_id, username, email, password_hash, display_name, enabled, created_at, updated_at)
                VALUES (?, 'outsider', 'outsider@auramusic.local', '$2a$10$placeholder', 'outsider', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, musicianRoleId);
        jdbcTemplate.update("""
                INSERT INTO users (role_id, username, email, password_hash, display_name, enabled, created_at, updated_at)
                VALUES (?, 'admin', 'admin@auramusic.local', '$2a$10$placeholder', 'admin', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, adminRoleId);

        Long musicianId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE email = 'musician@auramusic.local'", Long.class);
        Long bandmateId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE email = 'bandmate@auramusic.local'", Long.class);
        Long outsiderId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE email = 'outsider@auramusic.local'", Long.class);
        Long adminId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE email = 'admin@auramusic.local'", Long.class);

        jdbcTemplate.update("""
                INSERT INTO bands (leader_user_id, name, invite_code, created_at, updated_at)
                VALUES (?, 'Luna Session', 'LUNA-TEST', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, musicianId);
        Long bandId = jdbcTemplate.queryForObject("SELECT id FROM bands WHERE invite_code = 'LUNA-TEST'", Long.class);
        jdbcTemplate.update("""
                INSERT INTO band_members (band_id, user_id, instrument, member_role, joined_at)
                VALUES (?, ?, 'Voz', 'LEADER', CURRENT_TIMESTAMP)
                """, bandId, musicianId);
        jdbcTemplate.update("""
                INSERT INTO band_members (band_id, user_id, instrument, member_role, joined_at)
                VALUES (?, ?, 'Guitarra', 'MEMBER', CURRENT_TIMESTAMP)
                """, bandId, bandmateId);

        jdbcTemplate.update("""
                INSERT INTO artists (name, bio, created_at, updated_at)
                VALUES ('Luna Vale', 'Pop atmosferico', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """);
        seededArtist = artistRepository.findAll().get(0);

        jdbcTemplate.update("""
                INSERT INTO songs (artist_id, owner_user_id, title, duration_seconds, genre, explicit_content, play_count, created_at, updated_at)
                VALUES (?, ?, 'Cristal Azul', 214, 'Pop', FALSE, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, seededArtist.getId(), musicianId);
        jdbcTemplate.update("""
                INSERT INTO songs (artist_id, owner_user_id, title, duration_seconds, genre, explicit_content, play_count, created_at, updated_at)
                VALUES (?, ?, 'Cancion De Banda', 200, 'Rock', FALSE, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, seededArtist.getId(), bandmateId);
        jdbcTemplate.update("""
                INSERT INTO songs (artist_id, owner_user_id, title, duration_seconds, genre, explicit_content, play_count, created_at, updated_at)
                VALUES (?, ?, 'Cancion Oculta', 190, 'Pop', FALSE, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, seededArtist.getId(), outsiderId);
        jdbcTemplate.update("""
                INSERT INTO songs (artist_id, owner_user_id, title, duration_seconds, genre, explicit_content, play_count, created_at, updated_at)
                VALUES (?, ?, 'Cancion Admin', 180, 'Pop', FALSE, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, seededArtist.getId(), adminId);
    }

    @Test
    @WithMockUser(username = "musician@auramusic.local", roles = "MUSICIAN")
    void listsOnlyOwnSongsAndBandSongsForMusician() throws Exception {
        mockMvc.perform(get("/api/songs")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.title == 'Cristal Azul')]").exists())
                .andExpect(jsonPath("$.content[?(@.title == 'Cancion De Banda')]").exists())
                .andExpect(jsonPath("$.content[?(@.title == 'Cancion Oculta')]").doesNotExist())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @WithMockUser(username = "musician@auramusic.local", roles = "MUSICIAN")
    void cannotGetSongOutsideOwnBands() throws Exception {
        Long hiddenSongId = jdbcTemplate.queryForObject("SELECT id FROM songs WHERE title = 'Cancion Oculta'", Long.class);

        mockMvc.perform(get("/api/songs/{id}", hiddenSongId))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@auramusic.local", roles = "ADMIN")
    void adminCatalogIsAlsoLimitedToOwnSongsAndBands() throws Exception {
        mockMvc.perform(get("/api/songs")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.title == 'Cancion Admin')]").exists())
                .andExpect(jsonPath("$.content[?(@.title == 'Cristal Azul')]").doesNotExist())
                .andExpect(jsonPath("$.content[?(@.title == 'Cancion De Banda')]").doesNotExist())
                .andExpect(jsonPath("$.content[?(@.title == 'Cancion Oculta')]").doesNotExist())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(username = "musician@auramusic.local", roles = "MUSICIAN")
    void listsSongsWithPaginationAndFilters() throws Exception {
        mockMvc.perform(get("/api/songs")
                        .param("title", "cristal")
                        .param("genre", "POP")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content[0].title").value("Cristal Azul"))
                .andExpect(jsonPath("$.content[0].artist.name").value("Luna Vale"))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(username = "musician@auramusic.local", roles = "MUSICIAN")
    void filtersArtistsByName() throws Exception {
        mockMvc.perform(get("/api/artists")
                        .param("name", "luna"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Luna Vale"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(username = "musician@auramusic.local", roles = "MUSICIAN")
    void createsSongOwnedByAuthenticatedUser() throws Exception {
        mockMvc.perform(post("/api/songs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "artistId": %d,
                                  "title": "Luces Nuevas",
                                  "durationSeconds": 180,
                                  "genre": "Pop"
                                }
                                """.formatted(seededArtist.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Luces Nuevas"))
                .andExpect(jsonPath("$.owner.username").value("musician"));
    }

    @Test
    @WithMockUser(username = "musician@auramusic.local", roles = "MUSICIAN")
    void invalidSongReturnsValidationErrors() throws Exception {
        mockMvc.perform(post("/api/songs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "artistId": %d,
                                  "title": "",
                                  "durationSeconds": 0
                                }
                                """.formatted(seededArtist.getId())))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.fieldErrors.title").exists())
                .andExpect(jsonPath("$.fieldErrors.durationSeconds").exists());
    }

    @Test
    @WithMockUser(username = "musician@auramusic.local", roles = "MUSICIAN")
    void musicianCanCreateOwnedArtist() throws Exception {
        mockMvc.perform(post("/api/artists")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Nuevo Artista"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Nuevo Artista"))
                .andExpect(jsonPath("$.owner.username").value("musician"));
    }

    @Test
    @WithMockUser(username = "musician@auramusic.local", roles = "MUSICIAN")
    void musicianCannotUpdateSongWithoutOwnership() throws Exception {
        Long songId = jdbcTemplate.queryForObject("SELECT id FROM songs WHERE title = 'Cancion De Banda'", Long.class);

        mockMvc.perform(put("/api/songs/{id}", songId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "artistId": %d,
                                  "title": "Cambio no permitido",
                                  "durationSeconds": 200
                                }
                                """.formatted(seededArtist.getId())))
                .andExpect(status().isForbidden());
    }

}
