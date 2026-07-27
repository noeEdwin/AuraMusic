package com.auramusic.backend.band.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateBandRequest(
        @NotBlank @Size(max = 120) String name,
        @Size(max = 255) String description
) {
}
