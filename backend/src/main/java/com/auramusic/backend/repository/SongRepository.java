package com.auramusic.backend.repository;

import com.auramusic.backend.domain.entity.Song;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface SongRepository extends JpaRepository<Song, Long>, JpaSpecificationExecutor<Song> {
    @Override
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"artist", "album", "owner"})
    Page<Song> findAll(Specification<Song> specification, Pageable pageable);

    Page<Song> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    Page<Song> findByGenreIgnoreCase(String genre, Pageable pageable);
    Page<Song> findByOwnerId(Long ownerId, Pageable pageable);
}
