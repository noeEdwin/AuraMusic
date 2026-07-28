package com.auramusic.backend.band;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.auramusic.backend.domain.entity.Band;
import com.auramusic.backend.repository.BandRepository;
import com.auramusic.backend.repository.RoleRepository;
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
class BandIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private BandRepository bandRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @BeforeEach
    void setUp() {
        jdbcTemplate.update("DELETE FROM setlist_items");
        jdbcTemplate.update("DELETE FROM setlists");
        jdbcTemplate.update("DELETE FROM playlist_songs");
        jdbcTemplate.update("DELETE FROM playlists");
        jdbcTemplate.update("DELETE FROM songs");
        jdbcTemplate.update("DELETE FROM artists");
        jdbcTemplate.update("DELETE FROM band_members");
        jdbcTemplate.update("DELETE FROM bands");
        jdbcTemplate.update("DELETE FROM users");
        jdbcTemplate.update("DELETE FROM roles");

        jdbcTemplate.update("INSERT INTO roles (name, description, created_at) VALUES ('MUSICIAN', 'Musico', CURRENT_TIMESTAMP)");
        jdbcTemplate.update("INSERT INTO roles (name, description, created_at) VALUES ('SOLO', 'Solista', CURRENT_TIMESTAMP)");
        Long roleId = roleRepository.findByName("MUSICIAN").orElseThrow().getId();
        Long soloRoleId = roleRepository.findByName("SOLO").orElseThrow().getId();

        insertUser(roleId, "leader", "leader@auramusic.local");
        insertUser(roleId, "member", "member@auramusic.local");
        insertUser(soloRoleId, "outsider", "outsider@auramusic.local");

        Long leaderId = userRepository.findByEmail("leader@auramusic.local").orElseThrow().getId();
        jdbcTemplate.update("""
                INSERT INTO bands (leader_user_id, name, description, invite_code, created_at, updated_at)
                VALUES (?, 'Luna Session Band', 'Banda de pruebas', 'AURA-TEST-1234', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, leaderId);
        Long bandId = bandRepository.findByInviteCode("AURA-TEST-1234").orElseThrow().getId();
        jdbcTemplate.update("""
                INSERT INTO band_members (band_id, user_id, instrument, member_role, joined_at)
                VALUES (?, ?, 'Voz', 'LEADER', CURRENT_TIMESTAMP)
                """, bandId, leaderId);
    }

    @Test
    @WithMockUser(username = "leader@auramusic.local", roles = "MUSICIAN")
    void createsBandAndLeaderMember() throws Exception {
        mockMvc.perform(post("/api/bands")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Nueva Banda",
                                  "description": "Banda creada en test",
                                  "instrument": "Guitarra"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Nueva Banda"))
                .andExpect(jsonPath("$.inviteCode").isNotEmpty())
                .andExpect(jsonPath("$.members[0].memberRole").value("LEADER"));
    }

    @Test
    @WithMockUser(username = "member@auramusic.local", roles = "MUSICIAN")
    void joinsBandWithInviteCode() throws Exception {
        mockMvc.perform(post("/api/bands/join")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "inviteCode": "AURA-TEST-1234",
                                  "instrument": "Guitarra"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.instrument").value("Guitarra"))
                .andExpect(jsonPath("$.memberRole").value("MEMBER"));
    }

    @Test
    @WithMockUser(username = "member@auramusic.local", roles = "MUSICIAN")
    void rejectsAccessForUserOutsideBand() throws Exception {
        Long bandId = bandRepository.findByInviteCode("AURA-TEST-1234").orElseThrow().getId();

        mockMvc.perform(get("/api/bands/{bandId}", bandId))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "member@auramusic.local", roles = "MUSICIAN")
    void memberCannotUpdateBand() throws Exception {
        Long bandId = bandRepository.findByInviteCode("AURA-TEST-1234").orElseThrow().getId();

        mockMvc.perform(put("/api/bands/{bandId}", bandId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Cambio no permitido",
                                  "description": "No debe cambiarse"
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "outsider@auramusic.local", roles = "SOLO")
    void soloUserCannotCreateBand() throws Exception {
        mockMvc.perform(post("/api/bands")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Banda no permitida",
                                  "description": "No debe crearse",
                                  "instrument": "Voz"
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "member@auramusic.local", roles = "MUSICIAN")
    void rejectsDuplicateMembership() throws Exception {
        mockMvc.perform(post("/api/bands/join")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "inviteCode": "AURA-TEST-1234",
                                  "instrument": "Guitarra"
                                }
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/bands/join")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "inviteCode": "AURA-TEST-1234",
                                  "instrument": "Bajo"
                                }
                                """))
                .andExpect(status().isConflict());
    }

    private void insertUser(Long roleId, String username, String email) {
        jdbcTemplate.update("""
                INSERT INTO users (role_id, username, email, password_hash, display_name, enabled, created_at, updated_at)
                VALUES (?, ?, ?, '$2a$10$placeholder', ?, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, roleId, username, email, username);
    }
}
