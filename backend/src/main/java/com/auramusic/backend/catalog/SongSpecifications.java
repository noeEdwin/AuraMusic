package com.auramusic.backend.catalog;

import com.auramusic.backend.domain.entity.Song;
import java.util.Collection;
import org.springframework.data.jpa.domain.Specification;

final class SongSpecifications {

    private SongSpecifications() {
    }

    static Specification<Song> titleContains(String title) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.like(
                criteriaBuilder.lower(root.get("title")),
                "%" + title.trim().toLowerCase() + "%"
        );
    }

    static Specification<Song> genreEquals(String genre) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(
                criteriaBuilder.lower(root.get("genre")),
                genre.trim().toLowerCase()
        );
    }

    static Specification<Song> artistEquals(Long artistId) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(
                root.get("artist").get("id"),
                artistId
        );
    }

    static Specification<Song> ownerEquals(Long ownerId) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(
                root.get("owner").get("id"),
                ownerId
        );
    }

    static Specification<Song> ownerIn(Collection<Long> ownerIds) {
        return (root, query, criteriaBuilder) -> root.get("owner").get("id").in(ownerIds);
    }
}
