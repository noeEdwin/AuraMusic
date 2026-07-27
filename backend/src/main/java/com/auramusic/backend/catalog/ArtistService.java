package com.auramusic.backend.catalog;

import com.auramusic.backend.catalog.dto.ArtistResponse;
import com.auramusic.backend.catalog.dto.CreateArtistRequest;
import com.auramusic.backend.catalog.dto.PageResponse;
import com.auramusic.backend.catalog.dto.UpdateArtistRequest;
import com.auramusic.backend.domain.entity.Artist;
import com.auramusic.backend.domain.entity.User;
import com.auramusic.backend.repository.ArtistRepository;
import com.auramusic.backend.repository.UserRepository;
import java.util.Objects;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ArtistService {

    private static final int DEFAULT_PAGE_SIZE = 10;
    private static final int MAX_PAGE_SIZE = 50;
    private static final String ADMIN = "ADMIN";

    private final ArtistRepository artistRepository;
    private final UserRepository userRepository;

    public ArtistService(ArtistRepository artistRepository, UserRepository userRepository) {
        this.artistRepository = artistRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<ArtistResponse> search(String name, Pageable pageable) {
        Specification<Artist> specification = (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();
        if (hasText(name)) {
            specification = specification.and(ArtistSpecifications.nameContains(name));
        }

        Page<ArtistResponse> page = artistRepository.findAll(specification, normalize(pageable))
                .map(ArtistResponse::from);
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public ArtistResponse getById(Long id) {
        return ArtistResponse.from(findArtist(id));
    }

    @Transactional
    public ArtistResponse create(CreateArtistRequest request, String email) {
        requireAdmin(email);
        if (artistRepository.existsByName(request.name().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El artista ya esta registrado");
        }

        Artist artist = new Artist();
        artist.setName(request.name().trim());
        artist.setBio(normalize(request.bio()));
        artist.setImageUrl(normalize(request.imageUrl()));
        return ArtistResponse.from(artistRepository.save(artist));
    }

    @Transactional
    public ArtistResponse update(Long id, UpdateArtistRequest request, String email) {
        requireAdmin(email);
        Artist artist = findArtist(id);
        if (!artist.getName().equalsIgnoreCase(request.name().trim())
                && artistRepository.existsByName(request.name().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El artista ya esta registrado");
        }

        artist.setName(request.name().trim());
        artist.setBio(normalize(request.bio()));
        artist.setImageUrl(normalize(request.imageUrl()));
        return ArtistResponse.from(artistRepository.save(artist));
    }

    @Transactional
    public void delete(Long id, String email) {
        requireAdmin(email);
        artistRepository.delete(findArtist(id));
    }

    private void requireAdmin(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado"));
        if (user.getRole() == null || !Objects.equals(ADMIN, user.getRole().getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo un administrador puede modificar artistas");
        }
    }

    private Artist findArtist(Long id) {
        return artistRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Artista no encontrado"));
    }

    private Pageable normalize(Pageable pageable) {
        int page = Math.max(pageable.getPageNumber(), 0);
        int size = pageable.getPageSize() <= 0 ? DEFAULT_PAGE_SIZE : Math.min(pageable.getPageSize(), MAX_PAGE_SIZE);
        Sort sort = pageable.getSort().isSorted() ? pageable.getSort() : Sort.by("name").ascending();
        return PageRequest.of(page, size, sort);
    }

    private String normalize(String value) {
        return hasText(value) ? value.trim() : null;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
