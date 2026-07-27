package com.auramusic.backend.setlist;

import com.auramusic.backend.setlist.dto.AddSetlistItemRequest;
import com.auramusic.backend.setlist.dto.CreateSetlistRequest;
import com.auramusic.backend.setlist.dto.DuplicateSetlistRequest;
import com.auramusic.backend.setlist.dto.ReorderSetlistRequest;
import com.auramusic.backend.setlist.dto.SetlistResponse;
import com.auramusic.backend.setlist.dto.UpdateSetlistItemRequest;
import com.auramusic.backend.setlist.dto.UpdateSetlistRequest;
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
@RequestMapping("/api/setlists")
public class SetlistController {

    private final SetlistService setlistService;

    public SetlistController(SetlistService setlistService) {
        this.setlistService = setlistService;
    }

    @GetMapping
    public List<SetlistResponse> list(@AuthenticationPrincipal UserDetails userDetails) {
        return setlistService.list(userDetails.getUsername());
    }

    @GetMapping("/{id}")
    public SetlistResponse get(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return setlistService.get(id, userDetails.getUsername());
    }

    @PostMapping
    public ResponseEntity<SetlistResponse> create(
            @Valid @RequestBody CreateSetlistRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(setlistService.create(request, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    public SetlistResponse update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSetlistRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return setlistService.update(id, request, userDetails.getUsername());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        setlistService.delete(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/items")
    public SetlistResponse addItem(
            @PathVariable Long id,
            @Valid @RequestBody AddSetlistItemRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return setlistService.addItem(id, request, userDetails.getUsername());
    }

    @PutMapping("/{id}/items/reorder")
    public SetlistResponse reorder(
            @PathVariable Long id,
            @Valid @RequestBody ReorderSetlistRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return setlistService.reorder(id, request, userDetails.getUsername());
    }

    @PutMapping("/{id}/items/{itemId}")
    public SetlistResponse updateItem(
            @PathVariable Long id,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateSetlistItemRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return setlistService.updateItem(id, itemId, request, userDetails.getUsername());
    }

    @DeleteMapping("/{id}/items/{itemId}")
    public ResponseEntity<Void> removeItem(
            @PathVariable Long id,
            @PathVariable Long itemId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        setlistService.removeItem(id, itemId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/duplicate")
    public SetlistResponse duplicate(
            @PathVariable Long id,
            @Valid @RequestBody DuplicateSetlistRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return setlistService.duplicate(id, request, userDetails.getUsername());
    }
}
