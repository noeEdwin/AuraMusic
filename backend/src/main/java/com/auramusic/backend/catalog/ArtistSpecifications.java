package com.auramusic.backend.catalog;

import com.auramusic.backend.domain.entity.Artist;
import org.springframework.data.jpa.domain.Specification;

final class ArtistSpecifications {

    private ArtistSpecifications() {
    }

    static Specification<Artist> nameContains(String name) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.like(
                criteriaBuilder.lower(root.get("name")),
                "%" + name.trim().toLowerCase() + "%"
        );
    }
}
