package com.auramusic.backend.catalog.dto;

import com.auramusic.backend.domain.entity.Artist;

public record ArtistSummary(Long id, String name) {
    public static ArtistSummary from(Artist artist) {
        return new ArtistSummary(artist.getId(), artist.getName());
    }
}
