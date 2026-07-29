package com.auramusic.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank @Email @Size(max = 120) String email,
        @Size(max = 20) String phone,
        @NotBlank @Size(max = 100) String displayName,
        @Size(max = 500) String avatarUrl
) {
}
