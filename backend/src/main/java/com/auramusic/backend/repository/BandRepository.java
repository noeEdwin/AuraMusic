package com.auramusic.backend.repository;

import com.auramusic.backend.domain.entity.Band;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BandRepository extends JpaRepository<Band, Long> {
    Optional<Band> findByInviteCode(String inviteCode);
    boolean existsByInviteCode(String inviteCode);
}
