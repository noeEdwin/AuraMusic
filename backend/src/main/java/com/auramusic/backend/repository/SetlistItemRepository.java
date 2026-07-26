package com.auramusic.backend.repository;

import com.auramusic.backend.domain.entity.SetlistItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SetlistItemRepository extends JpaRepository<SetlistItem, Long> {
    List<SetlistItem> findBySetlistIdOrderByPositionAsc(Long setlistId);
}
