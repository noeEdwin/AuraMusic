package com.auramusic.backend.catalog.dto;

import com.auramusic.backend.domain.entity.Song;

public record SongResponse(
        Long id,
        String title,
        String album,
        String lyrics,
        Integer durationSeconds,
        String genre,
        String originalKey,
        Integer bpm,
        Boolean explicitContent,
        Long playCount,
        ArtistSummary artist,
        UserSummary owner
) {
    public static SongResponse from(Song song) {
        return new SongResponse(
                song.getId(),
                song.getTitle(),
                song.getAlbum(),
                song.getLyrics(),
                song.getDurationSeconds(),
                song.getGenre(),
                song.getOriginalKey(),
                song.getBpm(),
                song.getExplicitContent(),
                song.getPlayCount(),
                ArtistSummary.from(song.getArtist()),
                UserSummary.from(song.getOwner())
        );
    }
}
