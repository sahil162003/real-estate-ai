package com.sahil.realestateai.property;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PropertyRepository  extends JpaRepository<Property, Long> {

}
