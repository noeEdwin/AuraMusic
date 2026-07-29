package com.auramusic.backend.admin;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.auramusic.backend.domain.entity.Role;
import com.auramusic.backend.domain.entity.User;
import com.auramusic.backend.repository.RoleRepository;
import com.auramusic.backend.repository.UserRepository;
import com.auramusic.backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminUserIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    private User admin;
    private User musician;

    @BeforeEach
    void setUp() {
        jdbcTemplate.update("DELETE FROM password_reset_tokens");
        jdbcTemplate.update("DELETE FROM revoked_tokens");
        jdbcTemplate.update("DELETE FROM setlist_items");
        jdbcTemplate.update("DELETE FROM setlists");
        jdbcTemplate.update("DELETE FROM band_members");
        jdbcTemplate.update("DELETE FROM bands");
        jdbcTemplate.update("DELETE FROM playlist_songs");
        jdbcTemplate.update("DELETE FROM playlists");
        jdbcTemplate.update("DELETE FROM songs");
        jdbcTemplate.update("DELETE FROM artists");
        jdbcTemplate.update("DELETE FROM users");
        jdbcTemplate.update("DELETE FROM roles");

        jdbcTemplate.update("INSERT INTO roles (name, description, created_at) VALUES ('ADMIN', 'Administrador', CURRENT_TIMESTAMP)");
        jdbcTemplate.update("INSERT INTO roles (name, description, created_at) VALUES ('MUSICIAN', 'Musico', CURRENT_TIMESTAMP)");
        Long adminRoleId = roleRepository.findByName("ADMIN").orElseThrow().getId();
        Long musicianRoleId = roleRepository.findByName("MUSICIAN").orElseThrow().getId();
        insertUser(adminRoleId, "admin", "admin@auramusic.local");
        insertUser(musicianRoleId, "musician", "musician@auramusic.local");
        insertUser(musicianRoleId, "duplicate", "duplicate@auramusic.local");

        admin = userRepository.findByEmail("admin@auramusic.local").orElseThrow();
        musician = userRepository.findByEmail("musician@auramusic.local").orElseThrow();
    }

    @Test
    @WithMockUser(username = "admin@auramusic.local", roles = "ADMIN")
    void adminCanUpdateUserProfile() throws Exception {
        mockMvc.perform(put("/api/admin/users/{id}", musician.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "musico-actualizado",
                                  "email": "MUSICO.NUEVO@auramusic.local",
                                  "phone": "+521234567890",
                                  "displayName": "Musico Actualizado",
                                  "avatarUrl": "https://example.com/avatar.png"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(musician.getId()))
                .andExpect(jsonPath("$.username").value("musico-actualizado"))
                .andExpect(jsonPath("$.email").value("musico.nuevo@auramusic.local"))
                .andExpect(jsonPath("$.enabled").value(true));

        User updated = userRepository.findById(musician.getId()).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals("Musico Actualizado", updated.getDisplayName());
        org.junit.jupiter.api.Assertions.assertEquals("+521234567890", updated.getPhone());
    }

    @Test
    @WithMockUser(username = "admin@auramusic.local", roles = "ADMIN")
    void adminCannotUseAnotherUsersEmail() throws Exception {
        mockMvc.perform(put("/api/admin/users/{id}", musician.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "musician",
                                  "email": "duplicate@auramusic.local",
                                  "displayName": "Musico",
                                  "avatarUrl": ""
                                }
                                """))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser(username = "musician@auramusic.local", roles = "MUSICIAN")
    void nonAdminCannotUpdateOrDeactivateUsers() throws Exception {
        mockMvc.perform(put("/api/admin/users/{id}", admin.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "admin",
                                  "email": "admin@auramusic.local",
                                  "displayName": "Admin",
                                  "avatarUrl": ""
                                }
                                """))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/admin/users/{id}", admin.getId()))
                .andExpect(status().isForbidden());
    }

    @Test
    void deactivationBlocksExistingTokenAndPreservesUser() throws Exception {
        String adminToken = tokenFor(admin, "ADMIN");
        String musicianToken = tokenFor(musician, "MUSICIAN");

        mockMvc.perform(delete("/api/admin/users/{id}", musician.getId())
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isNoContent());

        User deactivated = userRepository.findById(musician.getId()).orElseThrow();
        org.junit.jupiter.api.Assertions.assertFalse(deactivated.getEnabled());

        mockMvc.perform(get("/api/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + musicianToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "admin@auramusic.local", roles = "ADMIN")
    void adminCannotDeactivateOwnAccount() throws Exception {
        mockMvc.perform(delete("/api/admin/users/{id}", admin.getId()))
                .andExpect(status().isBadRequest());
    }

    private void insertUser(Long roleId, String username, String email) {
        jdbcTemplate.update("""
                INSERT INTO users (role_id, username, email, password_hash, display_name, enabled, created_at, updated_at)
                VALUES (?, ?, ?, '$2a$10$placeholder', ?, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, roleId, username, email, username);
    }

    private String tokenFor(User user, String roleName) {
        Role role = new Role();
        role.setName(roleName);
        User tokenUser = new User();
        tokenUser.setId(user.getId());
        tokenUser.setEmail(user.getEmail());
        tokenUser.setRole(role);
        return jwtService.generateToken(tokenUser);
    }
}
