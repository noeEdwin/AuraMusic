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
    private static final String MUSICIAN = "MUSICIAN";
    private static final String SOLO = "SOLO";

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
        User owner = findUser(email);
        if (!isAdmin(owner) && !isMusicalUser(owner)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo un musico o solista puede crear artistas");
        }
        String name = request.name().trim();
        if (isAdmin(owner) ? artistRepository.existsByNameIgnoreCaseAndOwnerIsNull(name)
                : artistRepository.existsByNameIgnoreCaseAndOwnerId(name, owner.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El artista ya esta registrado");
        }

        Artist artist = new Artist();
        artist.setOwner(isAdmin(owner) ? null : owner);
        artist.setName(name);
        artist.setBio(normalize(request.bio()));
        artist.setImageUrl(normalize(request.imageUrl()));
        return ArtistResponse.from(artistRepository.save(artist));
    }

    @Transactional
    public ArtistResponse update(Long id, UpdateArtistRequest request, String email) {
        User user = findUser(email);
        Artist artist = findArtist(id);
        assertCanModify(artist, user);
        String name = request.name().trim();
        if (!artist.getName().equalsIgnoreCase(name)
                && (isAdmin(user) ? artistRepository.existsByNameIgnoreCaseAndOwnerIsNull(name)
                : artistRepository.existsByNameIgnoreCaseAndOwnerId(name, user.getId()))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El artista ya esta registrado");
        }

        artist.setName(name);
        artist.setBio(normalize(request.bio()));
        artist.setImageUrl(normalize(request.imageUrl()));
        return ArtistResponse.from(artistRepository.save(artist));
    }

    @Transactional
    public void delete(Long id, String email) {
        User user = findUser(email);
        Artist artist = findArtist(id);
        assertCanModify(artist, user);
        artistRepository.delete(artist);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado"));
    }

    private void assertCanModify(Artist artist, User user) {
        if (isAdmin(user) || (artist.getOwner() != null && artist.getOwner().getId().equals(user.getId()))) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permisos para modificar este artista");
    }

    private boolean isAdmin(User user) {
        return user.getRole() != null && Objects.equals(ADMIN, user.getRole().getName());
    }

    private boolean isMusicalUser(User user) {
        return user.getRole() != null && (Objects.equals(MUSICIAN, user.getRole().getName())
                || Objects.equals(SOLO, user.getRole().getName()));
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
