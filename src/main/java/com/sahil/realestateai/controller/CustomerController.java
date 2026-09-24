package com.sahil.realestateai.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sahil.realestateai.dto.PropertyPageResponseDto;
import com.sahil.realestateai.dto.PropertyResponseDto;
import com.sahil.realestateai.service.FavoriteService;
import com.sahil.realestateai.service.PropertyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerController {
	
	private final PropertyService propertyService;
	private final FavoriteService favoriteService;
	
	@GetMapping("/test")
	public String test() {
		return "Customer API is working fine";

}
	
	@GetMapping("/search")
	public PropertyPageResponseDto searchProperties(@RequestParam(required=false) String location, @RequestParam(required=false) Integer bedroom, @RequestParam(required=false) Double minPrice,
			@RequestParam(required = false) Double maxPrice,@RequestParam(required = false,defaultValue = "createdAt") String sortBy, @RequestParam(required = false,defaultValue = "asc") String sortOrder, @RequestParam(required = false,defaultValue = "0") int page) {
		
		return propertyService.searchProperties(location, bedroom, minPrice, maxPrice, sortBy, sortOrder,page);
	}
	
	
	@PostMapping("/favorites/{propertyId}")
    public String addFavorite(@PathVariable Long propertyId) {
        return favoriteService.addFavorite(propertyId);
    }


    @GetMapping("/favorites")
    public List<PropertyResponseDto> getFavorites() {
        return favoriteService.getFavorites();
    }


    @DeleteMapping("/favorites/{propertyId}")
    public String removeFavorite(@PathVariable Long propertyId) {
        return favoriteService.removeFavorite(propertyId);
    }
}
