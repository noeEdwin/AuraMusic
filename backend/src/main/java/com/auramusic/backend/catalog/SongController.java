package com.auramusic.backend.catalog;

import com.auramusic.backend.catalog.dto.CreateSongRequest;
import com.auramusic.backend.catalog.dto.PageResponse;
import com.auramusic.backend.catalog.dto.SongResponse;
import com.auramusic.backend.catalog.dto.UpdateSongRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/songs")
public class SongController {

    private final SongService songService;

    public SongController(SongService songService) {
        this.songService = songService;
    }

    @GetMapping
    public PageResponse<SongResponse> search(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) Long artistId,
            @RequestParam(required = false) Long ownerId,
            @PageableDefault(size = 10, sort = "title") Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return songService.search(title, genre, artistId, ownerId, pageable, userDetails.getUsername());
    }

    @GetMapping("/{id}")
    public SongResponse getById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return songService.getById(id, userDetails.getUsername());
    }

    @PostMapping
    public ResponseEntity<SongResponse> create(
            @Valid @RequestBody CreateSongRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(songService.create(request, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    public SongResponse update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSongRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return songService.update(id, request, userDetails.getUsername());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        songService.delete(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
