
package com.sahil.realestateai.service;

import java.io.IOException;
import java.util.Map;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(
    name = "app.storage.type",
    havingValue = "cloudinary"
)
public class CloudinaryStorageService implements ImageStorageService {

    private final Cloudinary cloudinary;

    private static final String FOLDER = "realestate/property-images";

    @Override
    public String uploadImage(MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file cannot be empty");
        }

        Map<?, ?> result = cloudinary.uploader().upload(
            file.getBytes(),
            ObjectUtils.asMap(
                "folder", FOLDER,
                "resource_type", "image"
            )
        );

        return (String) result.get("public_id");
    }

    @Override
    public String generateImageUrl(String key) {

        return cloudinary.url()
                .secure(true)
                .generate(key);
    }

    @Override
    public void deleteImage(String key) {

        try {
            cloudinary.uploader().destroy(
                key,
                ObjectUtils.asMap("resource_type", "image")
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete image from Cloudinary", e);
        }
    }
}
