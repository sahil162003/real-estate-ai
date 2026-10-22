
package com.sahil.realestateai.service;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.sahil.realestateai.dto.PropertyImageResponseDto;
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
    private final ImageStorageService imageStorageService;
    private final UserRepository userRepository;

    public String addImage(Long propertyId, MultipartFile file)
            throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Please select an image to upload.");
        }

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() ->
                        new PropertyNotFoundException("Property not found"));

        User loggedInUser = getLoggedInUser();

        if (!loggedInUser.getRole().equals(Role.ADMIN)) {
            User owner = property.getOwner();

            if (owner == null
                    || !loggedInUser.getId().equals(owner.getId())) {
                throw new PropertyNotFoundException(
                        "You are not authorized to add image to this property");
            }
        }

        String imageKey = imageStorageService.uploadImage(file);

        PropertyImage propertyImage = new PropertyImage();
        propertyImage.setProperty(property);
        propertyImage.setImageUrl(imageKey);

        propertyImageRepository.save(propertyImage);

        return "Image uploaded successfully";
    }

    public List<PropertyImageResponseDto> getImages(Long propertyId) {

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() ->
                        new PropertyNotFoundException("Property not found"));

        return propertyImageRepository.findByProperty(property)
                .stream()
                .map(image -> new PropertyImageResponseDto(
                        image.getId(),
                        imageStorageService.generateImageUrl(
                                image.getImageUrl())))
                .collect(Collectors.toList());
    }

    public String deleteImage(Long imageId) {

        User loggedInUser = getLoggedInUser();

        PropertyImage image = propertyImageRepository.findById(imageId)
                .orElseThrow(() ->
                        new PropertyNotFoundException("Image not found"));

        if (!loggedInUser.getRole().equals(Role.ADMIN)) {
            User owner = image.getProperty().getOwner();

            if (owner == null
                    || !loggedInUser.getId().equals(owner.getId())) {
                throw new PropertyNotFoundException(
                        "You are not authorized to delete this image");
            }
        }

        imageStorageService.deleteImage(image.getImageUrl());
        propertyImageRepository.delete(image);

        return "Image deleted successfully";
    }

    private User getLoggedInUser() {
        Authentication auth =
                SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()
                || auth.getName() == null
                || "anonymousUser".equals(auth.getName())) {
            throw new PropertyNotFoundException("User not authenticated");
        }

        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() ->
                        new PropertyNotFoundException("User not found"));
    }
}
