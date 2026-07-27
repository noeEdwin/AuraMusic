package com.auramusic.backend.catalog.dto;

import com.auramusic.backend.domain.entity.Album;

public record AlbumSummary(Long id, String title) {
    public static AlbumSummary from(Album album) {
        return album == null ? null : new AlbumSummary(album.getId(), album.getTitle());
    }
}
