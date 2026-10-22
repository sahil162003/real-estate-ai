
package com.sahil.realestateai.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@ConditionalOnProperty(
        name = "app.storage.type",
        havingValue = "local",
        matchIfMissing = true
)
public class LocalStorageService implements ImageStorageService {

    private final Path uploadDirectory =
            Paths.get("uploads", "property-images").toAbsolutePath().normalize();

    public LocalStorageService() throws IOException {
        Files.createDirectories(uploadDirectory);
    }

    @Override
    public String uploadImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please select an image to upload.");
        }

        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() == null
                        ? "image"
                        : file.getOriginalFilename()
        );

        if (originalFilename.contains("..")) {
            throw new IllegalArgumentException("Invalid image filename.");
        }

        String extension = "";

        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = originalFilename.substring(dotIndex);
        }

        String filename = UUID.randomUUID() + extension;
        Path targetPath = uploadDirectory.resolve(filename).normalize();

        if (!targetPath.startsWith(uploadDirectory)) {
            throw new IllegalArgumentException("Invalid image path.");
        }

        Files.copy(
                file.getInputStream(),
                targetPath,
                StandardCopyOption.REPLACE_EXISTING
        );

        return filename;
    }

    @Override
    public String generateImageUrl(String key) {
        return "http://localhost:8081/api/images/" + key;
    }

    @Override
    public void deleteImage(String key) {
        try {
            Path targetPath = uploadDirectory.resolve(key).normalize();

            if (!targetPath.startsWith(uploadDirectory)) {
                throw new IllegalArgumentException("Invalid image path.");
            }

            Files.deleteIfExists(targetPath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete property image.", e);
        }
    }

    public Path getUploadDirectory() {
        return uploadDirectory;
    }
}
