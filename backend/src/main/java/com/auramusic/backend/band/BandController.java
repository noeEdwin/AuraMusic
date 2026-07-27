package com.auramusic.backend.band;

import com.auramusic.backend.band.dto.AddBandMemberRequest;
import com.auramusic.backend.band.dto.BandMemberResponse;
import com.auramusic.backend.band.dto.BandResponse;
import com.auramusic.backend.band.dto.CreateBandRequest;
import com.auramusic.backend.band.dto.JoinBandRequest;
import com.auramusic.backend.band.dto.UpdateBandMemberRequest;
import com.auramusic.backend.band.dto.UpdateBandRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bands")
public class BandController {

    private final BandService bandService;

    public BandController(BandService bandService) {
        this.bandService = bandService;
    }

    @GetMapping
    public List<BandResponse> listBands(@AuthenticationPrincipal UserDetails userDetails) {
        return bandService.listUserBands(userDetails.getUsername());
    }

    @GetMapping("/{bandId}")
    public BandResponse getBand(
            @PathVariable Long bandId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return bandService.getBand(bandId, userDetails.getUsername());
    }

    @PostMapping
    public ResponseEntity<BandResponse> createBand(
            @Valid @RequestBody CreateBandRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bandService.create(request, userDetails.getUsername()));
    }

    @PutMapping("/{bandId}")
    public BandResponse updateBand(
            @PathVariable Long bandId,
            @Valid @RequestBody UpdateBandRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return bandService.update(bandId, request, userDetails.getUsername());
    }

    @DeleteMapping("/{bandId}")
    public ResponseEntity<Void> deleteBand(
            @PathVariable Long bandId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        bandService.delete(bandId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{bandId}/members")
    public List<BandMemberResponse> listMembers(
            @PathVariable Long bandId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return bandService.listMembers(bandId, userDetails.getUsername());
    }

    @PostMapping("/{bandId}/members")
    public BandMemberResponse addMember(
            @PathVariable Long bandId,
            @Valid @RequestBody AddBandMemberRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return bandService.addMember(bandId, request, userDetails.getUsername());
    }

    @PostMapping("/join")
    public BandMemberResponse join(
            @Valid @RequestBody JoinBandRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return bandService.join(request, userDetails.getUsername());
    }

    @PutMapping("/{bandId}/members/{memberId}")
    public BandMemberResponse updateMember(
            @PathVariable Long bandId,
            @PathVariable Long memberId,
            @Valid @RequestBody UpdateBandMemberRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return bandService.updateMember(bandId, memberId, request, userDetails.getUsername());
    }

    @DeleteMapping("/{bandId}/members/{memberId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long bandId,
            @PathVariable Long memberId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        bandService.removeMember(bandId, memberId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
