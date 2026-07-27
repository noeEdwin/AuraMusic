package com.auramusic.backend.setlist.dto;

import com.auramusic.backend.catalog.dto.SongResponse;
import com.auramusic.backend.domain.entity.SetlistItem;

public record SetlistItemResponse(
        Long id,
        Integer position,
        Integer transposeSteps,
        Integer breakSeconds,
        String notes,
        SongResponse song
) {
    public static SetlistItemResponse from(SetlistItem item) {
        return new SetlistItemResponse(
                item.getId(),
                item.getPosition(),
                item.getTransposeSteps(),
                item.getBreakSeconds(),
                item.getNotes(),
                SongResponse.from(item.getSong())
        );
    }
}
