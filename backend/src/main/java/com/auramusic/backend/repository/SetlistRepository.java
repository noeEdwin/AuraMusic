package com.auramusic.backend.repository;

import com.auramusic.backend.domain.entity.Setlist;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SetlistRepository extends JpaRepository<Setlist, Long> {
    List<Setlist> findByOwnerId(Long ownerId);
    List<Setlist> findByBandId(Long bandId);
    boolean existsByOwnerIdAndName(Long ownerId, String name);
}
