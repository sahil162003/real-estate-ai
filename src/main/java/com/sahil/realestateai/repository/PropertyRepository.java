package com.sahil.realestateai.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.sahil.realestateai.entity.Property;

public interface PropertyRepository  extends JpaRepository<Property, Long>,JpaSpecificationExecutor<Property> {


}
