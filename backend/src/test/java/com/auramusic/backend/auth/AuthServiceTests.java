package com.auramusic.backend.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.auramusic.backend.auth.dto.ForgotPasswordRequest;
import com.auramusic.backend.auth.dto.RegisterRequest;
import com.auramusic.backend.auth.dto.ResetPasswordRequest;
import com.auramusic.backend.domain.entity.PasswordResetToken;
import com.auramusic.backend.domain.entity.Role;
import com.auramusic.backend.domain.entity.User;
import com.auramusic.backend.notification.MailNotificationService;
import com.auramusic.backend.notification.SmsNotificationService;
import com.auramusic.backend.repository.PasswordResetTokenRepository;
import com.auramusic.backend.repository.RevokedTokenRepository;
import com.auramusic.backend.repository.RoleRepository;
import com.auramusic.backend.repository.UserRepository;
import com.auramusic.backend.security.JwtService;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class AuthServiceTests {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private RevokedTokenRepository revokedTokenRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private MailNotificationService mailNotificationService;

    @Mock
    private SmsNotificationService smsNotificationService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                roleRepository,
                revokedTokenRepository,
                passwordEncoder,
                jwtService,
                passwordResetTokenRepository,
                mailNotificationService,
                smsNotificationService,
                15
        );
    }

    @Test
    void registrationSendsWelcomeEmail() {
        Role role = role("MUSICIAN");
        User savedUser = user(1L, "new@auramusic.local");
        savedUser.setRole(role);
        when(userRepository.existsByEmail("new@auramusic.local")).thenReturn(false);
        when(userRepository.existsByUsername("new-user")).thenReturn(false);
        when(roleRepository.findByName("MUSICIAN")).thenReturn(Optional.of(role));
        when(passwordEncoder.encode("Secure1!")).thenReturn("hash");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtService.generateToken(savedUser)).thenReturn("jwt");
        when(jwtService.getExpirationMs()).thenReturn(3600000L);

        authService.register(new RegisterRequest(
                "new-user",
                "new@auramusic.local",
                "+529518695421",
                "Secure1!",
                "New User",
                "MUSICIAN"
        ));

        verify(mailNotificationService).sendWelcome(savedUser);
        verify(smsNotificationService).sendWelcome(savedUser);
    }

    @Test
    void createsHashedResetTokenWithFifteenMinuteExpiration() {
        User user = user(2L, "reset@auramusic.local");
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(jwtService.hashToken(any(String.class))).thenReturn("hashed-token");

        authService.requestPasswordReset(new ForgotPasswordRequest(user.getEmail()));

        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(passwordResetTokenRepository).save(tokenCaptor.capture());
        PasswordResetToken savedToken = tokenCaptor.getValue();

        assertEquals(user, savedToken.getUser());
        assertEquals("hashed-token", savedToken.getTokenHash());
        assertFalse(savedToken.getUsed());
        assertNotNull(savedToken.getExpiresAt());
        assertTrue(savedToken.getExpiresAt().isAfter(LocalDateTime.now().plusMinutes(14)));
        verify(mailNotificationService).sendPasswordReset(eq(user), any(String.class), eq(15L));
    }

    @Test
    void resetsPasswordAndConsumesToken() {
        User user = user(3L, "reset-user@auramusic.local");
        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setTokenHash("hashed-token");
        token.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        token.setUsed(false);
        when(jwtService.hashToken("raw-token")).thenReturn("hashed-token");
        when(passwordResetTokenRepository.findByTokenHash("hashed-token")).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("NewSecure1!")).thenReturn("new-hash");

        authService.resetPassword(new ResetPasswordRequest("raw-token", "NewSecure1!"));

        assertEquals("new-hash", user.getPasswordHash());
        assertTrue(token.getUsed());
        verify(userRepository).save(user);
        verify(passwordResetTokenRepository).save(token);
    }

    @Test
    void rejectsExpiredResetToken() {
        PasswordResetToken token = new PasswordResetToken();
        token.setExpiresAt(LocalDateTime.now().minusMinutes(1));
        token.setUsed(false);
        when(jwtService.hashToken("expired-token")).thenReturn("hashed-token");
        when(passwordResetTokenRepository.findByTokenHash("hashed-token")).thenReturn(Optional.of(token));

        assertThrows(ResponseStatusException.class, () ->
                authService.resetPassword(new ResetPasswordRequest("expired-token", "NewSecure1!"))
        );
    }

    private User user(Long id, String email) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        user.setUsername(email.substring(0, email.indexOf('@')));
        user.setDisplayName("Test User");
        return user;
    }

    private Role role(String name) {
        Role role = new Role();
        role.setId(1L);
        role.setName(name);
        return role;
    }
}
