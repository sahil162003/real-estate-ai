package com.sahil.realestateai.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.sahil.realestateai.dto.PropertyPageResponseDto;
import com.sahil.realestateai.dto.PropertyRequestDto;
import com.sahil.realestateai.dto.PropertyResponseDto;
import com.sahil.realestateai.entity.Property;
import com.sahil.realestateai.entity.Role;
import com.sahil.realestateai.entity.User;
import com.sahil.realestateai.exception.PropertyAccessDeniedException;
import com.sahil.realestateai.exception.PropertyNotFoundException;
import com.sahil.realestateai.mapper.PropertyMapper;
import com.sahil.realestateai.repository.PropertyRepository;
import com.sahil.realestateai.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.data.jpa.domain.Specification;

import com.sahil.realestateai.specification.PropertySpecification;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PropertyService {

	private final PropertyRepository propertyRepository;
	private final PropertyMapper propertyMapper;
	private final UserRepository userRepository;
	
	public PropertyResponseDto createProperties(PropertyRequestDto property) {
		
		Property property2=propertyMapper.toEntity(property);
		
		Authentication auth=SecurityContextHolder.getContext().getAuthentication();
		String str=auth.getName();
	User user=	userRepository.findByEmail(str).orElseThrow(()-> new PropertyNotFoundException("user not found"));
		property2.setOwner(user);
		Property property3=propertyRepository.save(property2);
		return propertyMapper.toResponse(property3);
	}
	
	public  List<PropertyResponseDto> getAllProperties() {
		
		return propertyRepository.findAll()
				.stream().
				map(propertyMapper::toResponse)
				.collect(Collectors.toList());
	}

	public PropertyResponseDto getProperty(Long id) {
	 
		
			Property p1=	propertyRepository.findById(id).orElseThrow(()-> new PropertyNotFoundException("Propert does not exist"));
			return propertyMapper.toResponse(p1) ;
	}

	public PropertyResponseDto updateProperty( Long id,PropertyRequestDto e) {
		Property p=propertyRepository.findById(id).orElseThrow(()->new PropertyNotFoundException("no property found"));
          Authentication auth=SecurityContextHolder.getContext().getAuthentication();
           String email=  auth.getName();
           User user=userRepository.findByEmail(email).orElseThrow(()-> new PropertyNotFoundException("user not found"));
		   if(user.getRole()!=Role.ADMIN && !user.getId().equals(p.getOwner().getId())) {
			   throw new PropertyAccessDeniedException("you are not authorized to update this property");
		   }
	
	p.setTitle(e.getTitle());
	p.setBedrooms(e.getBedrooms());
	p.setLocation(e.getLocation());
	p.setPrice(e.getPrice());
	 propertyRepository.save(p);
	
		return propertyMapper.toResponse(p);
	}

	public String deleteById(Long id) {
		Optional<Property> exist=propertyRepository.findById(id);
		
		if(exist.isEmpty())
			throw new PropertyNotFoundException("Property does not exists");
		
		Property p=exist.get();
		 Authentication auth=SecurityContextHolder.getContext().getAuthentication();
         String email=  auth.getName();
         User user=userRepository.findByEmail(email).orElseThrow(()-> new PropertyNotFoundException("user not found"));
		   if(user.getRole()!=Role.ADMIN && !user.getId().equals(p.getOwner().getId())) {
			   throw new PropertyAccessDeniedException("you are not authorized to delete this property");
		   }
       propertyRepository.deleteById(id);
		return "deleted Successfully";
	}

	public PropertyPageResponseDto searchProperties(String location, Integer bedroom, Double minPrice, Double maxPrice,String sortBy, String sortOrder, int page) {
		
	if(!sortBy.equalsIgnoreCase("price") && !sortBy.equalsIgnoreCase("bedrooms") && !sortBy.equalsIgnoreCase("createdAt")) {
			throw new IllegalArgumentException("Invalid sortBy parameter. Allowed values are: price, bedrooms, createdAt");
		}
	if(!sortOrder.equalsIgnoreCase("asc") && !sortOrder.equalsIgnoreCase("desc")) {
			throw new IllegalArgumentException("Invalid sortOrder parameter. Allowed values are: asc, desc");
		}
	
	
	
		Sort sort = sortOrder.equalsIgnoreCase("asc")
		        ? Sort.by(sortBy).ascending()
		        : Sort.by(sortBy).descending();

		    Pageable pageable = PageRequest.of(page, 10, sort);

		    Specification<Property> specification =
		            Specification
		                    .where(PropertySpecification.hasLocation(location))
		                    .and(PropertySpecification.hasBedrooms(bedroom))
		                    .and(PropertySpecification.hasMinPrice(minPrice))
		                    .and(PropertySpecification.hasMaxPrice(maxPrice));

		    Page<PropertyResponseDto> propertyPage = propertyRepository.findAll(specification, pageable)
		            .map(propertyMapper::toResponse);
		    
		    return new PropertyPageResponseDto(
		            propertyPage.getContent(),
		            propertyPage.getNumber(),
		            propertyPage.getSize(),
		            propertyPage.getTotalElements(),
		            propertyPage.getTotalPages(),
		            propertyPage.isLast()
		    );
	}
}
