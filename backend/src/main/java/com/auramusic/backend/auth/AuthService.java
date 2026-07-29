package com.auramusic.backend.auth;

import com.auramusic.backend.auth.dto.AuthResponse;
import com.auramusic.backend.auth.dto.CurrentUserResponse;
import com.auramusic.backend.auth.dto.ForgotPasswordRequest;
import com.auramusic.backend.auth.dto.LoginRequest;
import com.auramusic.backend.auth.dto.RegisterRequest;
import com.auramusic.backend.auth.dto.ResetPasswordRequest;
import com.auramusic.backend.domain.entity.PasswordResetToken;
import com.auramusic.backend.auth.dto.UpdateProfileRequest;
import com.auramusic.backend.domain.entity.RevokedToken;
import com.auramusic.backend.domain.entity.Role;
import com.auramusic.backend.domain.entity.User;
import com.auramusic.backend.repository.RevokedTokenRepository;
import com.auramusic.backend.repository.RoleRepository;
import com.auramusic.backend.repository.PasswordResetTokenRepository;
import com.auramusic.backend.repository.UserRepository;
import com.auramusic.backend.security.JwtService;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.security.SecureRandom;
import java.util.Base64;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.auramusic.backend.notification.MailNotificationService;

@Service
public class AuthService {

    private static final String TOKEN_TYPE = "Bearer";
    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_MUSICIAN = "MUSICIAN";
    private static final String ROLE_SOLO = "SOLO";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RevokedTokenRepository revokedTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final MailNotificationService mailNotificationService;
    private final long passwordResetExpirationMinutes;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            RevokedTokenRepository revokedTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            PasswordResetTokenRepository passwordResetTokenRepository,
            MailNotificationService mailNotificationService,
            @org.springframework.beans.factory.annotation.Value("${auramusic.auth.password-reset-expiration-minutes:15}") long passwordResetExpirationMinutes
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.revokedTokenRepository = revokedTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.mailNotificationService = mailNotificationService;
        this.passwordResetExpirationMinutes = passwordResetExpirationMinutes;
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales invalidas"));

        if (!Boolean.TRUE.equals(user.getEnabled()) || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales invalidas");
        }

        return createAuthResponse(user);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String roleName = request.role().trim().toUpperCase();
        if (ROLE_ADMIN.equals(roleName) || (!ROLE_MUSICIAN.equals(roleName) && !ROLE_SOLO.equals(roleName))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rol de registro no permitido");
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo ya esta registrado");
        }

        if (userRepository.existsByUsername(request.username())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El username ya esta registrado");
        }

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Rol no configurado"));

        User user = new User();
        user.setRole(role);
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPhone(request.phone().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setDisplayName(request.displayName());
        user.setEnabled(true);

        User savedUser = userRepository.save(user);
        mailNotificationService.sendWelcome(savedUser);
        return createAuthResponse(savedUser);
    }

    @Transactional
    public void requestPasswordReset(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.email()).ifPresent(user -> {
            passwordResetTokenRepository.deleteByUserIdAndUsedFalse(user.getId());
            String token = generateResetToken();

            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setUser(user);
            resetToken.setTokenHash(jwtService.hashToken(token));
            resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(passwordResetExpirationMinutes));
            resetToken.setUsed(false);
            passwordResetTokenRepository.save(resetToken);
            mailNotificationService.sendPasswordReset(user, token, passwordResetExpirationMinutes);
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(jwtService.hashToken(request.token()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "El token de recuperacion no es valido"));
        if (Boolean.TRUE.equals(resetToken.getUsed()) || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El token de recuperacion expiro");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        userRepository.save(user);
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    @Transactional(readOnly = true)
    public CurrentUserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado"));
        return CurrentUserResponse.from(user);
    }

    @Transactional
    public AuthResponse updateProfile(UpdateProfileRequest request, String currentEmail, String currentToken) {
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado"));
        String email = request.email().trim().toLowerCase();

        if (!email.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmailAndIdNot(email, user.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo ya esta registrado");
        }

        user.setEmail(email);
        user.setPhone(normalize(request.phone()));
        user.setDisplayName(request.displayName().trim());
        user.setAvatarUrl(normalize(request.avatarUrl()));
        User savedUser = userRepository.save(user);
        logout(currentToken);
        return createAuthResponse(savedUser);
    }

    @Transactional
    public void logout(String token) {
        String tokenHash = jwtService.hashToken(token);
        if (revokedTokenRepository.existsByTokenHash(tokenHash)) {
            return;
        }

        RevokedToken revokedToken = new RevokedToken();
        revokedToken.setTokenHash(tokenHash);
        revokedToken.setExpiresAt(LocalDateTime.ofInstant(jwtService.extractExpiration(token).toInstant(), ZoneId.systemDefault()));
        revokedTokenRepository.save(revokedToken);
    }

    private AuthResponse createAuthResponse(User user) {
        String token = jwtService.generateToken(user);
        return new AuthResponse(token, TOKEN_TYPE, jwtService.getExpirationMs(), CurrentUserResponse.from(user));
    }

    private String generateResetToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
