package com.auramusic.backend.admin;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
import org.springframework.security.crypto.password.PasswordEncoder;
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

    @Autowired
    private PasswordEncoder passwordEncoder;

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
    void adminCanCreateAndGetAnotherAdmin() throws Exception {
        String adminToken = tokenFor(admin, "ADMIN");

        mockMvc.perform(post("/api/admin/users")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "second-admin",
                                  "email": "SECOND.ADMIN@auramusic.local",
                                  "phone": "+529518695423",
                                  "password": "SecondAdmin1!",
                                  "displayName": "Second Admin",
                                  "avatarUrl": "",
                                  "role": "ADMIN"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("second-admin"))
                .andExpect(jsonPath("$.email").value("second.admin@auramusic.local"))
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.enabled").value(true));

        User created = userRepository.findByEmail("second.admin@auramusic.local").orElseThrow();
        org.junit.jupiter.api.Assertions.assertTrue(passwordEncoder.matches("SecondAdmin1!", created.getPasswordHash()));

        mockMvc.perform(get("/api/admin/users/{id}", created.getId())
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(created.getId()))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    @WithMockUser(username = "admin@auramusic.local", roles = "ADMIN")
    void adminCreationRejectsDuplicateEmailAndInvalidRole() throws Exception {
        mockMvc.perform(post("/api/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "new-admin",
                                  "email": "duplicate@auramusic.local",
                                  "phone": "+529518695423",
                                  "password": "SecondAdmin1!",
                                  "displayName": "Second Admin",
                                  "role": "ADMIN"
                                }
                                """))
                .andExpect(status().isConflict());

        mockMvc.perform(post("/api/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "new-admin",
                                  "email": "new.admin@auramusic.local",
                                  "phone": "+529518695423",
                                  "password": "SecondAdmin1!",
                                  "displayName": "Second Admin",
                                  "role": "OWNER"
                                }
                                """))
                .andExpect(status().isBadRequest());
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
    @WithMockUser(username = "admin@auramusic.local", roles = "ADMIN")
    void adminCanActivateDeactivatedUser() throws Exception {
        musician.setEnabled(false);
        userRepository.save(musician);

        mockMvc.perform(put("/api/admin/users/{id}/activate", musician.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(musician.getId()))
                .andExpect(jsonPath("$.enabled").value(true));

        User activated = userRepository.findById(musician.getId()).orElseThrow();
        org.junit.jupiter.api.Assertions.assertTrue(activated.getEnabled());
    }

    @Test
    @WithMockUser(username = "musician@auramusic.local", roles = "MUSICIAN")
    void nonAdminCannotUpdateOrDeactivateUsers() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/users/{id}", admin.getId()))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "forbidden-admin",
                                  "email": "forbidden.admin@auramusic.local",
                                  "phone": "+529518695423",
                                  "password": "SecondAdmin1!",
                                  "displayName": "Forbidden Admin",
                                  "role": "ADMIN"
                                }
                                """))
                .andExpect(status().isForbidden());

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

        mockMvc.perform(put("/api/admin/users/{id}/activate", admin.getId()))
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
