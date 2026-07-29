package com.auramusic.backend.setlist.dto;

import java.util.Map;

public record SetlistMetricsResponse(
        Integer averageBpm,
        String dominantKey,
        Map<String, Integer> keyDistribution
) {
}
