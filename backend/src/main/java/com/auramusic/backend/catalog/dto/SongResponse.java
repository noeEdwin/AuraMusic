package com.auramusic.backend.catalog.dto;

import com.auramusic.backend.domain.entity.Song;

public record SongResponse(
        Long id,
        String title,
        String lyrics,
        Integer durationSeconds,
        String genre,
        String originalKey,
        Integer bpm,
        String audioUrl,
        String coverUrl,
        Integer trackNumber,
        Boolean explicitContent,
        Long playCount,
        ArtistSummary artist,
        AlbumSummary album,
        UserSummary owner
) {
    public static SongResponse from(Song song) {
        return new SongResponse(
                song.getId(),
                song.getTitle(),
                song.getLyrics(),
                song.getDurationSeconds(),
                song.getGenre(),
                song.getOriginalKey(),
                song.getBpm(),
                song.getAudioUrl(),
                song.getCoverUrl(),
                song.getTrackNumber(),
                song.getExplicitContent(),
                song.getPlayCount(),
                ArtistSummary.from(song.getArtist()),
                AlbumSummary.from(song.getAlbum()),
                UserSummary.from(song.getOwner())
        );
    }
}
