package com.auramusic.backend.catalog;

import com.auramusic.backend.catalog.dto.CreateSongRequest;
import com.auramusic.backend.catalog.dto.PageResponse;
import com.auramusic.backend.catalog.dto.SongResponse;
import com.auramusic.backend.catalog.dto.UpdateSongRequest;
import com.auramusic.backend.domain.entity.Artist;
import com.auramusic.backend.domain.entity.Song;
import com.auramusic.backend.domain.entity.User;
import com.auramusic.backend.repository.ArtistRepository;
import com.auramusic.backend.repository.SongRepository;
import com.auramusic.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SongService {

    private static final int DEFAULT_PAGE_SIZE = 10;
    private static final int MAX_PAGE_SIZE = 50;
    private static final String ADMIN = "ADMIN";

    private final SongRepository songRepository;
    private final ArtistRepository artistRepository;
    private final UserRepository userRepository;

    public SongService(
            SongRepository songRepository,
            ArtistRepository artistRepository,
            UserRepository userRepository
    ) {
        this.songRepository = songRepository;
        this.artistRepository = artistRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<SongResponse> search(
            String title,
            String genre,
            Long artistId,
            Long ownerId,
            Pageable pageable
    ) {
        Specification<Song> specification = (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();
        if (hasText(title)) {
            specification = specification.and(SongSpecifications.titleContains(title));
        }
        if (hasText(genre)) {
            specification = specification.and(SongSpecifications.genreEquals(genre));
        }
        if (artistId != null) {
            specification = specification.and(SongSpecifications.artistEquals(artistId));
        }
        if (ownerId != null) {
            specification = specification.and(SongSpecifications.ownerEquals(ownerId));
        }

        Page<SongResponse> page = songRepository.findAll(specification, normalize(pageable))
                .map(SongResponse::from);
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public SongResponse getById(Long id) {
        return SongResponse.from(findSong(id));
    }

    @Transactional
    public SongResponse create(CreateSongRequest request, String email) {
        User owner = findUser(email);
        Artist artist = findArtist(request.artistId());

        Song song = new Song();
        song.setArtist(artist);
        song.setOwner(owner);
        apply(song, request);
        return SongResponse.from(songRepository.save(song));
    }

    @Transactional
    public SongResponse update(Long id, UpdateSongRequest request, String email) {
        User user = findUser(email);
        Song song = findSong(id);
        assertCanModify(song, user);
        Artist artist = findArtist(request.artistId());

        song.setArtist(artist);
        apply(song, request);
        return SongResponse.from(songRepository.save(song));
    }

    @Transactional
    public void delete(Long id, String email) {
        User user = findUser(email);
        Song song = findSong(id);
        assertCanModify(song, user);
        songRepository.delete(song);
    }

    private void apply(Song song, CreateSongRequest request) {
        song.setTitle(request.title().trim());
        song.setAlbum(normalize(request.album()));
        song.setLyrics(request.lyrics());
        song.setDurationSeconds(request.durationSeconds());
        song.setGenre(normalize(request.genre()));
        song.setOriginalKey(normalize(request.originalKey()));
        song.setBpm(request.bpm());
        song.setExplicitContent(Boolean.TRUE.equals(request.explicitContent()));
    }

    private void apply(Song song, UpdateSongRequest request) {
        song.setTitle(request.title().trim());
        song.setAlbum(normalize(request.album()));
        song.setLyrics(request.lyrics());
        song.setDurationSeconds(request.durationSeconds());
        song.setGenre(normalize(request.genre()));
        song.setOriginalKey(normalize(request.originalKey()));
        song.setBpm(request.bpm());
        song.setExplicitContent(Boolean.TRUE.equals(request.explicitContent()));
    }

    private void assertCanModify(Song song, User user) {
        if (isAdmin(user) || (song.getOwner() != null && song.getOwner().getId().equals(user.getId()))) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permisos para modificar esta cancion");
    }

    private boolean isAdmin(User user) {
        return user.getRole() != null && ADMIN.equals(user.getRole().getName());
    }

    private Song findSong(Long id) {
        return songRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cancion no encontrada"));
    }

    private Artist findArtist(Long id) {
        return artistRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Artista no encontrado"));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado"));
    }

    private Pageable normalize(Pageable pageable) {
        int page = Math.max(pageable.getPageNumber(), 0);
        int size = pageable.getPageSize() <= 0 ? DEFAULT_PAGE_SIZE : Math.min(pageable.getPageSize(), MAX_PAGE_SIZE);
        Sort sort = pageable.getSort().isSorted() ? pageable.getSort() : Sort.by("title").ascending();
        return PageRequest.of(page, size, sort);
    }

    private String normalize(String value) {
        return hasText(value) ? value.trim() : null;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
