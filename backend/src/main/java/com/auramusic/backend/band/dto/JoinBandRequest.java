package com.auramusic.backend.band.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record JoinBandRequest(
        @NotBlank @Size(max = 40) String inviteCode,
        @NotBlank @Size(max = 80) String instrument
) {
}
