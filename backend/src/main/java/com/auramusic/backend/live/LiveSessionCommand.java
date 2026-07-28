package com.auramusic.backend.live;

public record LiveSessionCommand(
        String type,
        Long setlistId,
        Long activeItemId,
        Integer positionSeconds
) {
}
