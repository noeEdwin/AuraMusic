package com.auramusic.backend.auth;

import com.auramusic.backend.auth.dto.AuthResponse;
import com.auramusic.backend.auth.dto.CurrentUserResponse;
import com.auramusic.backend.auth.dto.LoginRequest;
import com.auramusic.backend.auth.dto.MessageResponse;
import com.auramusic.backend.auth.dto.RegisterRequest;
import com.auramusic.backend.auth.dto.UpdateProfileRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @GetMapping("/me")
    public CurrentUserResponse me(@AuthenticationPrincipal UserDetails userDetails) {
        return authService.getCurrentUser(userDetails.getUsername());
    }

    @PutMapping("/profile")
    public AuthResponse updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader
    ) {
        return authService.updateProfile(
                request,
                userDetails.getUsername(),
                authorizationHeader.substring("Bearer ".length())
        );
    }

    @PostMapping("/logout")
    public MessageResponse logout(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader) {
        authService.logout(authorizationHeader.substring("Bearer ".length()));
        return new MessageResponse("Sesion cerrada correctamente");
    }
}
