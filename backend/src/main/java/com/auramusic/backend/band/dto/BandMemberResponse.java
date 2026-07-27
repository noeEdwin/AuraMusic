package com.auramusic.backend.band.dto;

import com.auramusic.backend.domain.entity.BandMember;

public record BandMemberResponse(
        Long id,
        UserSummary user,
        String instrument,
        String memberRole
) {
    public static BandMemberResponse from(BandMember member) {
        return new BandMemberResponse(
                member.getId(),
                UserSummary.from(member.getUser()),
                member.getInstrument(),
                member.getMemberRole()
        );
    }
}
