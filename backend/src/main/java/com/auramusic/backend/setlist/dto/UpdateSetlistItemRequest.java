package com.auramusic.backend.setlist.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record UpdateSetlistItemRequest(
        @Min(-12) @Max(12) Integer transposeSteps,
        @Min(0) Integer breakSeconds,
        @Size(max = 255) String notes
) {
}
