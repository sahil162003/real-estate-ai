package com.sahil.realestateai.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sahil.realestateai.entity.Favorite;
import com.sahil.realestateai.entity.Property;
import com.sahil.realestateai.entity.User;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    Optional<Favorite> findByUserAndProperty(User user, Property property);

    List<Favorite> findByUser(User user);

    void deleteByUserAndProperty(User user, Property property);
}