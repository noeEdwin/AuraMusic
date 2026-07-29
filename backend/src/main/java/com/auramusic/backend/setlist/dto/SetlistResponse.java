package com.auramusic.backend.setlist.dto;

import com.auramusic.backend.band.dto.UserSummary;
import com.auramusic.backend.domain.entity.Setlist;
import java.time.LocalDate;
import java.util.List;

public record SetlistResponse(
        Long id,
        String name,
        String description,
        LocalDate eventDate,
        UserSummary owner,
        Long bandId,
        List<SetlistItemResponse> items,
        int totalDurationSeconds,
        SetlistMetricsResponse metrics
) {
    public static SetlistResponse from(
            Setlist setlist,
            List<SetlistItemResponse> items,
            int totalDurationSeconds,
            SetlistMetricsResponse metrics
    ) {
        return new SetlistResponse(
                setlist.getId(),
                setlist.getName(),
                setlist.getDescription(),
                setlist.getEventDate(),
                UserSummary.from(setlist.getOwner()),
                setlist.getBand() == null ? null : setlist.getBand().getId(),
                items,
                totalDurationSeconds,
                metrics
        );
    }
}
