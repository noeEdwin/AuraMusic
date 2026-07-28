package com.auramusic.backend.live;

import java.time.Instant;

public record LiveSessionState(
        Long bandId,
        boolean active,
        Long setlistId,
        Long activeItemId,
        boolean playing,
        int positionSeconds,
        Instant updatedAt
) {
    public static LiveSessionState inactive(Long bandId) {
        return new LiveSessionState(bandId, false, null, null, false, 0, Instant.now());
    }
}
