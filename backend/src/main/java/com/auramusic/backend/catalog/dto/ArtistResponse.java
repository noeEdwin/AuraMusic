package com.auramusic.backend.catalog.dto;

import com.auramusic.backend.domain.entity.Artist;

public record ArtistResponse(
        Long id,
        String name,
        String bio,
        String imageUrl,
        UserSummary owner
) {
    public static ArtistResponse from(Artist artist) {
        return new ArtistResponse(
                artist.getId(),
                artist.getName(),
                artist.getBio(),
                artist.getImageUrl(),
                UserSummary.from(artist.getOwner())
        );
    }
}
