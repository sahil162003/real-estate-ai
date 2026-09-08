package com.sahil.realestateai.property;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sahil.realestateai.dto.PropertyRequestDto;
import com.sahil.realestateai.dto.PropertyResponseDto;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {

private final PropertyService propertyService;
	
@PostMapping("/createProperties")
public  PropertyResponseDto createProperties( @Valid
		@RequestBody PropertyRequestDto property) {
	
	
	return  propertyService.createProperties(property);
		
}

@GetMapping("/getAllProperties")
public List<PropertyResponseDto> getAllProperties(){
	
	return propertyService.getAllProperties();
	
}

@GetMapping("/getProperties/{id}")
public PropertyResponseDto getProperty(@PathVariable Long id) {
	
	return propertyService.getProperty(id);
	
}

@PutMapping("/updateProperties/{id}")
public PropertyResponseDto updateProperty(@PathVariable Long id , @Valid @RequestBody PropertyRequestDto e) {
	
	return propertyService.updateProperty(id,e);
}

@DeleteMapping("/deleteProperties")
public String deleteProperties(@RequestParam Long id) {
	System.out.println(id);
	return propertyService.deleteById(id);
}
	
}
