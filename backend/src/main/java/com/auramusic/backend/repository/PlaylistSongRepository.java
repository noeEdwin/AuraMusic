package com.auramusic.backend.repository;

import com.auramusic.backend.domain.entity.PlaylistSong;
import com.auramusic.backend.domain.entity.PlaylistSongId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlaylistSongRepository extends JpaRepository<PlaylistSong, PlaylistSongId> {
    List<PlaylistSong> findByPlaylistIdOrderByPositionAsc(Long playlistId);
}
