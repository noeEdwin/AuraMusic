package com.auramusic.backend.band.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateBandMemberRequest(
        @NotBlank @Size(max = 80) String instrument
) {
}
