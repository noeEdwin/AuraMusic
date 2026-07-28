package com.auramusic.backend.auth;

import com.auramusic.backend.auth.dto.AuthResponse;
import com.auramusic.backend.auth.dto.CurrentUserResponse;
import com.auramusic.backend.auth.dto.LoginRequest;
import com.auramusic.backend.auth.dto.RegisterRequest;
import com.auramusic.backend.domain.entity.RevokedToken;
import com.auramusic.backend.domain.entity.Role;
import com.auramusic.backend.domain.entity.User;
import com.auramusic.backend.repository.RevokedTokenRepository;
import com.auramusic.backend.repository.RoleRepository;
import com.auramusic.backend.repository.UserRepository;
import com.auramusic.backend.security.JwtService;
import java.time.LocalDateTime;
import java.time.ZoneId;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            RevokedTokenRepository revokedTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.revokedTokenRepository = revokedTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
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
        return createAuthResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public CurrentUserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado"));
        return CurrentUserResponse.from(user);
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
}
