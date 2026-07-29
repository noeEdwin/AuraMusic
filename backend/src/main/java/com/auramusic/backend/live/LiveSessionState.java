package com.auramusic.backend.live;

import java.time.Instant;

public record LiveSessionState(
        Long bandId,
        boolean active,
        Long setlistId,
        Long activeItemId,
        boolean playing,
        long positionMillis,
        double playbackRate,
        Instant updatedAt
) {
    public static LiveSessionState inactive(Long bandId) {
        return new LiveSessionState(bandId, false, null, null, false, 0, 1.0, Instant.now());
    }
}
