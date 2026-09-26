package com.sahil.realestateai.service;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.sahil.realestateai.entity.Property;
import com.sahil.realestateai.entity.PropertyImage;
import com.sahil.realestateai.entity.Role;
import com.sahil.realestateai.entity.User;
import com.sahil.realestateai.exception.PropertyNotFoundException;
import com.sahil.realestateai.repository.PropertyImageRepository;
import com.sahil.realestateai.repository.PropertyRepository;
import com.sahil.realestateai.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PropertyImageService {

    private final PropertyImageRepository propertyImageRepository;
    private final PropertyRepository propertyRepository;
    private final S3Service s3Service;
    private final UserRepository userRepository;

    public String addImage(Long propertyId, MultipartFile file) throws IOException {

        // Get property
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() ->
                        new PropertyNotFoundException("Property not found"));

        // Get logged-in user
        Authentication auth =
                SecurityContextHolder.getContext().getAuthentication();

        String email = auth.getName();

        User loggedInUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new PropertyNotFoundException("User not found"));

        // Check authorization
        if (!loggedInUser.getRole().equals(Role.ADMIN)) {

            User owner = property.getOwner();

            if (!loggedInUser.getId().equals(owner.getId())) {

                throw new PropertyNotFoundException(
                        "You are not authorized to add image to this property");
            }
        }

        // Upload image to S3
        String imageKey = s3Service.uploadImage(file);

        // Save image information in PostgreSQL
        PropertyImage propertyImage = new PropertyImage();

        propertyImage.setProperty(property);
        propertyImage.setImageUrl(imageKey);

        propertyImageRepository.save(propertyImage);

        return "Image uploaded successfully";
    }

    public List<String> getImages(Long propertyId) {

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() ->
                        new PropertyNotFoundException("Property not found"));

        return propertyImageRepository.findByProperty(property)
                .stream()
                .map(image ->
                        s3Service.generatePresignedUrl(image.getImageUrl()))
                .collect(Collectors.toList());
    }

    public String deleteImage(Long imageId) {
    	
    	Authentication auth= SecurityContextHolder.getContext().getAuthentication();
    	
    	String email=auth.getName();
    	Optional<User> loggedInUser=userRepository.findByEmail(email);
    	User loguser=loggedInUser.get();
    	
    	

        PropertyImage image = propertyImageRepository.findById(imageId)
                .orElseThrow(() ->
                        new PropertyNotFoundException("Image not found"));

     if(!loguser.getRole().equals(Role.ADMIN)) {
    		
    	User user= image.getProperty().getOwner();;
    		
    	if(!loguser.getId().equals(user.getId())) {
			
			throw new PropertyNotFoundException("You are not authorized to delete this image");
		}
	 }
    	
    	
        // Delete image from AWS S3
        s3Service.deleteImage(image.getImageUrl());

        // Delete image record from PostgreSQL
        propertyImageRepository.delete(image);

        return "Image deleted successfully";
    }
}