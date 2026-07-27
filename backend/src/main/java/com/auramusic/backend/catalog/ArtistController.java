package com.auramusic.backend.catalog;

import com.auramusic.backend.catalog.dto.ArtistResponse;
import com.auramusic.backend.catalog.dto.CreateArtistRequest;
import com.auramusic.backend.catalog.dto.PageResponse;
import com.auramusic.backend.catalog.dto.UpdateArtistRequest;
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
@RequestMapping("/api/artists")
public class ArtistController {

    private final ArtistService artistService;

    public ArtistController(ArtistService artistService) {
        this.artistService = artistService;
    }

    @GetMapping
    public PageResponse<ArtistResponse> search(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Boolean verified,
            @PageableDefault(size = 10, sort = "name") Pageable pageable
    ) {
        return artistService.search(name, verified, pageable);
    }

    @GetMapping("/{id}")
    public ArtistResponse getById(@PathVariable Long id) {
        return artistService.getById(id);
    }

    @PostMapping
    public ResponseEntity<ArtistResponse> create(
            @Valid @RequestBody CreateArtistRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(artistService.create(request, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    public ArtistResponse update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateArtistRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return artistService.update(id, request, userDetails.getUsername());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        artistService.delete(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
