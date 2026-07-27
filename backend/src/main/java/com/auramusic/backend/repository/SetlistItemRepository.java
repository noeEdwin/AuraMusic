package com.auramusic.backend.repository;

import com.auramusic.backend.domain.entity.SetlistItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SetlistItemRepository extends JpaRepository<SetlistItem, Long> {
    List<SetlistItem> findBySetlistIdOrderByPositionAsc(Long setlistId);
    Optional<SetlistItem> findBySetlistIdAndId(Long setlistId, Long itemId);
}
