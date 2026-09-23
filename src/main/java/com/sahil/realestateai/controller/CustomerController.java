package com.sahil.realestateai.controller;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sahil.realestateai.dto.PropertyResponseDto;
import com.sahil.realestateai.service.PropertyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerController {
	
	private final PropertyService propertyService;
	
	@GetMapping("/test")
	public String test() {
		return "Customer API is working fine";

}
	
	@GetMapping("/search")
	public Page<PropertyResponseDto> searchProperties(@RequestParam(required=false) String location, @RequestParam(required=false) Integer bedroom, @RequestParam(required=false) Double minPrice,
			@RequestParam(required = false) Double maxPrice,@RequestParam(required = false,defaultValue = "createdAt") String sortBy, @RequestParam(required = false,defaultValue = "asc") String sortOrder, @RequestParam(required = false,defaultValue = "0") int page) {
		
		return propertyService.searchProperties(location, bedroom, minPrice, maxPrice, sortBy, sortOrder,page);
	}
}
