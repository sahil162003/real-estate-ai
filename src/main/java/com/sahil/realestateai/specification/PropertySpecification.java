package com.sahil.realestateai.specification;

import org.springframework.data.jpa.domain.Specification;

import com.sahil.realestateai.entity.Property;

public class PropertySpecification {

    public static Specification<Property> hasLocation(String location) {

        return (root, query, criteriaBuilder) -> {

            if (location == null || location.isBlank()) {
                return null;
            }

            return criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("location")),
                    "%" + location.toLowerCase() + "%"
            );
        };
    }

    public static Specification<Property> hasBedrooms(Integer bedrooms) {

        return (root, query, criteriaBuilder) -> {

            if (bedrooms == null) {
                return null;
            }

            return criteriaBuilder.equal(
                    root.get("bedrooms"),
                    bedrooms
            );
        };
    }

    public static Specification<Property> hasMinPrice(Double minPrice) {

        return (root, query, criteriaBuilder) -> {

            if (minPrice == null) {
                return null;
            }

            return criteriaBuilder.greaterThanOrEqualTo(
                    root.get("price"),
                    minPrice
            );
        };
    }

    public static Specification<Property> hasMaxPrice(Double maxPrice) {

        return (root, query, criteriaBuilder) -> {

            if (maxPrice == null) {
                return null;
            }

            return criteriaBuilder.lessThanOrEqualTo(
                    root.get("price"),
                    maxPrice
            );
        };
    }
}