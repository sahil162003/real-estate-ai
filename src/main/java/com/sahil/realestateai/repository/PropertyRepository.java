package com.sahil.realestateai.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.sahil.realestateai.entity.Property;
import com.sahil.realestateai.entity.User;

public interface PropertyRepository  extends JpaRepository<Property, Long>,JpaSpecificationExecutor<Property> {

	List<Property> findByOwner(User user);


}
