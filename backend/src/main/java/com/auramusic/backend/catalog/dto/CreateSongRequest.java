package com.auramusic.backend.catalog.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateSongRequest(
        @NotNull Long artistId,
        Long albumId,
        @NotBlank @Size(max = 160) String title,
        String lyrics,
        @NotNull @Min(1) Integer durationSeconds,
        @Size(max = 80) String genre,
        @Size(max = 10) String originalKey,
        @Min(1) Integer bpm,
        @NotBlank @Size(max = 500) String audioUrl,
        @Size(max = 500) String coverUrl,
        @Min(1) Integer trackNumber,
        Boolean explicitContent
) {
}
