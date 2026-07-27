package com.auramusic.backend.repository;

import com.auramusic.backend.domain.entity.Artist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ArtistRepository extends JpaRepository<Artist, Long>, JpaSpecificationExecutor<Artist> {
    Page<Artist> findByNameContainingIgnoreCase(String name, Pageable pageable);
    boolean existsByName(String name);
}
