package com.sahil.realestateai.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.sahil.realestateai.entity.PropertyInquiry;
import com.sahil.realestateai.entity.User;

public interface InquiryRepository extends JpaRepository<PropertyInquiry, Long>{

	List<PropertyInquiry> findByCustomer(User user);
	
    List<PropertyInquiry> findByPropertyOwner(User owner);

}
