package com.auramusic.backend.auth.dto;

public record AuthResponse(
        String token,
        String tokenType,
        long expiresIn,
        CurrentUserResponse user
) {
}
