package com.sahil.realestateai.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.sahil.realestateai.dto.PropertyResponseDto;
import com.sahil.realestateai.entity.Favorite;
import com.sahil.realestateai.entity.Property;
import com.sahil.realestateai.entity.User;
import com.sahil.realestateai.exception.PropertyNotFoundException;
import com.sahil.realestateai.mapper.PropertyMapper;
import com.sahil.realestateai.repository.FavoriteRepository;
import com.sahil.realestateai.repository.PropertyRepository;
import com.sahil.realestateai.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FavoriteService {
	
	private final PropertyRepository propertyRepository;
	private final UserRepository userRepository;
	private final FavoriteRepository favoriteRepository;
	private final PropertyMapper propertyMapper;

	public String addFavorite(Long propertyId) {
		Authentication auth= SecurityContextHolder.getContext().getAuthentication();
		String email=auth.getName();
		User user=userRepository.findByEmail(email).orElseThrow(()->new RuntimeException("User not found"));
		
		Property property=propertyRepository.findById(propertyId).orElseThrow(()->new PropertyNotFoundException("Property not found"));
		
		 if(favoriteRepository.findByUserAndProperty(user,property).isPresent()) {
			 return "Property already in favorites";
		 }
		Favorite favorite=new Favorite();
		favorite.setUser(user);
		favorite.setProperty(property);
		favoriteRepository.save(favorite);
		return "Property added to favorites";
	}

	public List<PropertyResponseDto> getFavorites() {
		
		  Authentication auth =
	                SecurityContextHolder.getContext().getAuthentication();

	        String email = auth.getName();

	        User user = userRepository.findByEmail(email)
	                .orElseThrow(() ->
	                        new PropertyNotFoundException("User not found"));

	        return favoriteRepository.findByUser(user)
	                .stream()
	                .map(Favorite::getProperty)
	                .map(propertyMapper::toResponse)
	                .collect(Collectors.toList());
	}

	public String removeFavorite(Long propertyId) {
		// TODO Auto-generated method stub
		Authentication auth =
                SecurityContextHolder.getContext().getAuthentication();

        String email = auth.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new PropertyNotFoundException("User not found"));

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() ->
                        new PropertyNotFoundException("Property not found"));

        Favorite favorite = favoriteRepository
                .findByUserAndProperty(user, property)
                .orElseThrow(() ->
                        new PropertyNotFoundException(
                                "Property is not in your favorites"));

        favoriteRepository.delete(favorite);

        return "Property removed from favorites successfully";
	}

}
