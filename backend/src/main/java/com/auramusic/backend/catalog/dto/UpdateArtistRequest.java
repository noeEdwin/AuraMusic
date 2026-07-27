package com.auramusic.backend.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateArtistRequest(
        @NotBlank @Size(max = 120) String name,
        @Size(max = 5000) String bio,
        @Size(max = 500) String imageUrl
) {
}
