package com.auramusic.backend.band.dto;

import com.auramusic.backend.domain.entity.Band;
import java.util.List;

public record BandResponse(
        Long id,
        String name,
        String description,
        String inviteCode,
        UserSummary leader,
        List<BandMemberResponse> members
) {
    public static BandResponse from(Band band, List<BandMemberResponse> members) {
        return new BandResponse(
                band.getId(),
                band.getName(),
                band.getDescription(),
                band.getInviteCode(),
                UserSummary.from(band.getLeader()),
                members
        );
    }
}
