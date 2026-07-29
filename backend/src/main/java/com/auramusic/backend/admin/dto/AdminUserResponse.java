package com.auramusic.backend.admin.dto;

import com.auramusic.backend.domain.entity.User;

public record AdminUserResponse(
        Long id,
        String username,
        String email,
        String phone,
        String displayName,
        String avatarUrl,
        String role,
        Boolean enabled
) {
    public static AdminUserResponse from(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPhone(),
                user.getDisplayName(),
                user.getAvatarUrl(),
                user.getRole().getName(),
                user.getEnabled()
        );
    }
}
