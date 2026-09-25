package com.sahil.realestateai.service;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.sahil.realestateai.entity.Property;
import com.sahil.realestateai.entity.PropertyImage;
import com.sahil.realestateai.exception.PropertyNotFoundException;
import com.sahil.realestateai.repository.PropertyImageRepository;
import com.sahil.realestateai.repository.PropertyRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PropertyImageService {

    private final PropertyImageRepository propertyImageRepository;
    private final PropertyRepository propertyRepository;
    private final S3Service s3Service;

    public String addImage(Long propertyId, MultipartFile file) throws IOException {

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() ->
                        new PropertyNotFoundException("Property not found"));

        String imageKey = s3Service.uploadImage(file);

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

        PropertyImage image = propertyImageRepository.findById(imageId)
                .orElseThrow(() ->
                        new PropertyNotFoundException("Image not found"));

        // Delete image from AWS S3
        s3Service.deleteImage(image.getImageUrl());

        // Delete image record from PostgreSQL
        propertyImageRepository.delete(image);

        return "Image deleted successfully";
    }
}