package com.auramusic.backend.catalog.dto;

import com.auramusic.backend.domain.entity.User;

public record UserSummary(Long id, String username, String displayName) {
    public static UserSummary from(User user) {
        return user == null ? null : new UserSummary(user.getId(), user.getUsername(), user.getDisplayName());
    }
}
