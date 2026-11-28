
package com.sahil.realestateai.controller;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.sahil.realestateai.service.LocalStorageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
@ConditionalOnProperty(
		name = "app.storage.type",
		havingValue = "local",
		matchIfMissing = true
)
public class LocalImageController {

    private final LocalStorageService localStorageService;

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Path uploadDir = localStorageService.getUploadDirectory();

            Path filePath = uploadDir.resolve(filename).normalize();

            System.out.println("========== IMAGE REQUEST ==========");
            System.out.println("Filename: " + filename);
            System.out.println("Upload directory: " + uploadDir);
            System.out.println("File path: " + filePath);
            System.out.println("File exists: " + java.nio.file.Files.exists(filePath));

            if (!filePath.startsWith(uploadDir)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Invalid image path");
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Image not found");
            }

            String contentType = java.nio.file.Files.probeContentType(filePath);

            MediaType mediaType = contentType != null
                    ? MediaType.parseMediaType(contentType)
                    : MediaType.APPLICATION_OCTET_STREAM;

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .body(resource);

        } catch (IOException e) {
            e.printStackTrace();

            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Could not read image", e);
        }
    }
}