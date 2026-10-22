
package com.sahil.realestateai.service;

import java.io.IOException;
import org.springframework.web.multipart.MultipartFile;

public interface ImageStorageService {

    String uploadImage(MultipartFile file) throws IOException;

    String generateImageUrl(String key);

    void deleteImage(String key);
}
