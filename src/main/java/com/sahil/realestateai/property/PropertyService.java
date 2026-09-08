package com.sahil.realestateai.property;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.sahil.realestateai.dto.PropertyRequestDto;
import com.sahil.realestateai.dto.PropertyResponseDto;
import com.sahil.realestateai.exception.PropertyNotFoundException;
import com.sahil.realestateai.mapper.PropertyMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PropertyService {

	private final PropertyRepository propertyRepository;
	private final PropertyMapper propertyMapper;
	
	public PropertyResponseDto createProperties(PropertyRequestDto property) {
		
		Property property2=propertyMapper.toEntity(property);
		
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
		Property p=propertyRepository.findById(id).orElseThrow(()->new PropertyNotFoundException("no property founf"));

	
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
       propertyRepository.deleteById(id);
		return "deleted Successfully";
	}
}
