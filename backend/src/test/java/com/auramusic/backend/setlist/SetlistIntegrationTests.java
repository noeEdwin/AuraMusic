package com.auramusic.backend.setlist;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.auramusic.backend.domain.entity.Band;
import com.auramusic.backend.domain.entity.Setlist;
import com.auramusic.backend.domain.entity.Song;
import com.auramusic.backend.repository.BandRepository;
import com.auramusic.backend.repository.RoleRepository;
import com.auramusic.backend.repository.SetlistRepository;
import com.auramusic.backend.repository.SongRepository;
import com.auramusic.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SetlistIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SongRepository songRepository;

    @Autowired
    private BandRepository bandRepository;

    @Autowired
    private SetlistRepository setlistRepository;

    private Song firstSong;
    private Song secondSong;

    @BeforeEach
    void setUp() {
        jdbcTemplate.update("DELETE FROM setlist_items");
        jdbcTemplate.update("DELETE FROM setlists");
        jdbcTemplate.update("DELETE FROM band_members");
        jdbcTemplate.update("DELETE FROM bands");
        jdbcTemplate.update("DELETE FROM playlist_songs");
        jdbcTemplate.update("DELETE FROM playlists");
        jdbcTemplate.update("DELETE FROM songs");
        jdbcTemplate.update("DELETE FROM albums");
        jdbcTemplate.update("DELETE FROM artists");
        jdbcTemplate.update("DELETE FROM users");
        jdbcTemplate.update("DELETE FROM roles");

        jdbcTemplate.update("INSERT INTO roles (name, description, created_at) VALUES ('MUSICIAN', 'Musico', CURRENT_TIMESTAMP)");
        Long roleId = roleRepository.findByName("MUSICIAN").orElseThrow().getId();
        insertUser(roleId, "owner", "owner@auramusic.local");
        insertUser(roleId, "outsider", "outsider@auramusic.local");

        jdbcTemplate.update("INSERT INTO artists (name, created_at, updated_at) VALUES ('Test Artist', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)");
        Long artistId = jdbcTemplate.queryForObject("SELECT id FROM artists WHERE name = 'Test Artist'", Long.class);
        insertSong(artistId, "Song One", 180);
        insertSong(artistId, "Song Two", 240);
        firstSong = songRepository.findAll().stream().filter(song -> song.getTitle().equals("Song One")).findFirst().orElseThrow();
        secondSong = songRepository.findAll().stream().filter(song -> song.getTitle().equals("Song Two")).findFirst().orElseThrow();

        Long ownerId = userRepository.findByEmail("owner@auramusic.local").orElseThrow().getId();
        jdbcTemplate.update("""
                INSERT INTO bands (leader_user_id, name, description, invite_code, created_at, updated_at)
                VALUES (?, 'Test Band', 'Banda de prueba', 'SETLIST-BAND-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, ownerId);
        Long bandId = bandRepository.findByInviteCode("SETLIST-BAND-1").orElseThrow().getId();
        jdbcTemplate.update("""
                INSERT INTO band_members (band_id, user_id, instrument, member_role, joined_at)
                VALUES (?, ?, 'Voz', 'LEADER', CURRENT_TIMESTAMP)
                """, bandId, ownerId);
    }

    @Test
    @WithMockUser(username = "owner@auramusic.local", roles = "MUSICIAN")
    void createsSetlistForAuthenticatedOwner() throws Exception {
        mockMvc.perform(post("/api/setlists")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Set de prueba",
                                  "description": "Repertorio de prueba",
                                  "eventDate": "2026-08-01"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Set de prueba"))
                .andExpect(jsonPath("$.totalDurationSeconds").value(0))
                .andExpect(jsonPath("$.owner.username").value("owner"));
    }

    @Test
    @WithMockUser(username = "owner@auramusic.local", roles = "MUSICIAN")
    void calculatesDurationWithSongsAndBreaks() throws Exception {
        mockMvc.perform(post("/api/setlists")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Duration Set\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        Long setlistId = setlistRepository.findByOwnerId(
                userRepository.findByEmail("owner@auramusic.local").orElseThrow().getId()
        ).stream().filter(setlist -> setlist.getName().equals("Duration Set")).findFirst().orElseThrow().getId();

        mockMvc.perform(post("/api/setlists/{id}/items", setlistId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"songId\":%d,\"breakSeconds\":10}".formatted(firstSong.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalDurationSeconds").value(190));

        mockMvc.perform(post("/api/setlists/{id}/items", setlistId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"songId\":%d,\"breakSeconds\":5}".formatted(secondSong.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalDurationSeconds").value(435));
    }

    @Test
    @WithMockUser(username = "outsider@auramusic.local", roles = "MUSICIAN")
    void outsiderCannotReadAnotherUsersSetlist() throws Exception {
        Long ownerId = userRepository.findByEmail("owner@auramusic.local").orElseThrow().getId();
        jdbcTemplate.update("""
                INSERT INTO setlists (owner_user_id, name, description, created_at, updated_at)
                VALUES (?, 'Private Set', 'Privado', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, ownerId);
        Setlist setlist = setlistRepository.findByOwnerId(ownerId).stream()
                .filter(value -> value.getName().equals("Private Set"))
                .findFirst()
                .orElseThrow();

        mockMvc.perform(get("/api/setlists/{id}", setlist.getId()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "owner@auramusic.local", roles = "MUSICIAN")
    void rejectsDuplicateSetlistNameForSameOwner() throws Exception {
        mockMvc.perform(post("/api/setlists")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Unique Set\"}"))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/setlists")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Unique Set\"}"))
                .andExpect(status().isConflict());
    }

    private void insertUser(Long roleId, String username, String email) {
        jdbcTemplate.update("""
                INSERT INTO users (role_id, username, email, password_hash, display_name, enabled, created_at, updated_at)
                VALUES (?, ?, ?, '$2a$10$placeholder', ?, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, roleId, username, email, username);
    }

    private void insertSong(Long artistId, String title, int duration) {
        jdbcTemplate.update("""
                INSERT INTO songs (artist_id, title, duration_seconds, genre, audio_url, explicit_content, play_count, created_at, updated_at)
                VALUES (?, ?, ?, 'Pop', 'https://audio.example/song.mp3', FALSE, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, artistId, title, duration);
    }
}
