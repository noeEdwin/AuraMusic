package com.auramusic.backend.setlist.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record ReorderSetlistRequest(@NotEmpty List<Long> itemIds) {
}
