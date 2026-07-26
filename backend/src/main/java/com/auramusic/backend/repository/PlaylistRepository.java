package com.auramusic.backend.repository;

import com.auramusic.backend.domain.entity.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlaylistRepository extends JpaRepository<Playlist, Long> {
    boolean existsByUserIdAndName(Long userId, String name);
}
