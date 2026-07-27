package com.auramusic.backend.catalog;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.auramusic.backend.domain.entity.Artist;
import com.auramusic.backend.domain.entity.Song;
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
                VALUES (?, 'admin', 'admin@auramusic.local', '$2a$10$placeholder', 'admin', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, adminRoleId);

        jdbcTemplate.update("""
                INSERT INTO artists (name, bio, verified, created_at, updated_at)
                VALUES ('Luna Vale', 'Pop atmosferico', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """);
        seededArtist = artistRepository.findAll().get(0);

        jdbcTemplate.update("""
                INSERT INTO songs (artist_id, title, duration_seconds, genre, audio_url, explicit_content, play_count, created_at, updated_at)
                VALUES (?, 'Cristal Azul', 214, 'Pop', 'https://audio.example/cristal-azul.mp3', FALSE, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, seededArtist.getId());
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
    void filtersArtistsByNameAndVerifiedStatus() throws Exception {
        mockMvc.perform(get("/api/artists")
                        .param("name", "luna")
                        .param("verified", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Luna Vale"))
                .andExpect(jsonPath("$.content[0].verified").value(true))
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
                                  "genre": "Pop",
                                  "audioUrl": "https://audio.example/luces-nuevas.mp3"
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
                                  "durationSeconds": 0,
                                  "audioUrl": ""
                                }
                                """.formatted(seededArtist.getId())))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.fieldErrors.title").exists())
                .andExpect(jsonPath("$.fieldErrors.durationSeconds").exists())
                .andExpect(jsonPath("$.fieldErrors.audioUrl").exists());
    }

    @Test
    @WithMockUser(username = "musician@auramusic.local", roles = "MUSICIAN")
    void nonAdminCannotCreateArtist() throws Exception {
        mockMvc.perform(post("/api/artists")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Nuevo Artista"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Solo un administrador puede modificar artistas"));
    }

    @Test
    @WithMockUser(username = "musician@auramusic.local", roles = "MUSICIAN")
    void musicianCannotUpdateSongWithoutOwnership() throws Exception {
        Song song = songRepository.findAll().get(0);

        mockMvc.perform(put("/api/songs/{id}", song.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "artistId": %d,
                                  "title": "Cambio no permitido",
                                  "durationSeconds": 200,
                                  "audioUrl": "https://audio.example/no-permitido.mp3"
                                }
                                """.formatted(seededArtist.getId())))
                .andExpect(status().isForbidden());
    }

}
