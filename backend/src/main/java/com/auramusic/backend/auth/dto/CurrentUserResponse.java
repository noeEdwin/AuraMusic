package com.auramusic.backend.auth.dto;

import com.auramusic.backend.domain.entity.User;

public record CurrentUserResponse(
        Long id,
        String username,
        String email,
        String phone,
        String displayName,
        String avatarUrl,
        String role
) {
    public static CurrentUserResponse from(User user) {
        return new CurrentUserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPhone(),
                user.getDisplayName(),
                user.getAvatarUrl(),
                user.getRole().getName()
        );
    }
}
