package com.sahil.realestateai.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sahil.realestateai.entity.Property;

@Repository
public interface PropertyRepository  extends JpaRepository<Property, Long> {

}
