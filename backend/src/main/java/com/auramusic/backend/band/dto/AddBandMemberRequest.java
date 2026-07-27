package com.auramusic.backend.band.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddBandMemberRequest(
        @NotBlank @Email String userEmail,
        @NotBlank @Size(max = 80) String instrument
) {
}
