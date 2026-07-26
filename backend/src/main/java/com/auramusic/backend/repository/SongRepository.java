package com.auramusic.backend.repository;

import com.auramusic.backend.domain.entity.Song;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SongRepository extends JpaRepository<Song, Long> {
    Page<Song> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    Page<Song> findByGenreIgnoreCase(String genre, Pageable pageable);
    Page<Song> findByOwnerId(Long ownerId, Pageable pageable);
}
