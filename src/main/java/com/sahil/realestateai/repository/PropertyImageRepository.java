package com.sahil.realestateai.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sahil.realestateai.entity.Property;
import com.sahil.realestateai.entity.PropertyImage;

public interface PropertyImageRepository extends JpaRepository<PropertyImage, Long> {

    List<PropertyImage> findByProperty(Property property);

}