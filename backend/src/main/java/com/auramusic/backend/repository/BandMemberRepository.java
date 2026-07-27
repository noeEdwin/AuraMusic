package com.auramusic.backend.repository;

import com.auramusic.backend.domain.entity.BandMember;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BandMemberRepository extends JpaRepository<BandMember, Long> {
    List<BandMember> findByBandId(Long bandId);
    List<BandMember> findByUserId(Long userId);
    boolean existsByBandIdAndUserId(Long bandId, Long userId);
    Optional<BandMember> findByBandIdAndUserId(Long bandId, Long userId);
    Optional<BandMember> findByBandIdAndId(Long bandId, Long memberId);
    void deleteByBandIdAndUserId(Long bandId, Long userId);
}
