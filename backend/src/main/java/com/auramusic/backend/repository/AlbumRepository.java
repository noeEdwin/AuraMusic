package com.auramusic.backend.repository;

import com.auramusic.backend.domain.entity.Album;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlbumRepository extends JpaRepository<Album, Long> {
    boolean existsByArtistIdAndTitle(Long artistId, String title);
}
