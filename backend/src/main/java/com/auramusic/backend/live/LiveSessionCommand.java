package com.auramusic.backend.live;

public record LiveSessionCommand(
        String type,
        Long setlistId,
        Long activeItemId,
        Long positionMillis,
        Double playbackRate
) {
}
