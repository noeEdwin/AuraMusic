package com.auramusic.backend.setlist.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreateSetlistRequest(
        @NotBlank @Size(max = 140) String name,
        @Size(max = 255) String description,
        LocalDate eventDate,
        Long bandId
) {
}
