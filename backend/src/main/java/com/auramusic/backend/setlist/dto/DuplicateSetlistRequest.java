package com.auramusic.backend.setlist.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DuplicateSetlistRequest(@NotBlank @Size(max = 140) String name) {
}
