
package com.sahil.realestateai.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sahil.realestateai.dto.AiPropertySearchRequestDto;
import com.sahil.realestateai.dto.PropertyPageResponseDto;
import com.sahil.realestateai.service.GeminiService;
import com.sahil.realestateai.service.PropertyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class GeminiTestController {

    private final GeminiService geminiService;
    private final PropertyService propertyService;

    @PostMapping("/test")
    public Map<String, String> testGemini(
            @RequestBody Map<String, String> request) {

        String prompt = request.getOrDefault(
                "prompt",
                "Reply with exactly: RealEstateAI AI connection works"
        );

        return Map.of(
                "response",
                geminiService.testGemini(prompt)
        );
    }

    @PostMapping("/extract-criteria")
    public AiPropertySearchRequestDto extractCriteria(
            @RequestBody Map<String, String> request) {

        String prompt = request.get("prompt");

        return geminiService.extractPropertySearchCriteria(prompt);
    }


@PostMapping("/search-properties")
public PropertyPageResponseDto searchPropertiesWithAI(
        @RequestBody Map<String, String> request) {

    String prompt = request.get("prompt");

    AiPropertySearchRequestDto criteria =
            geminiService.extractPropertySearchCriteria(prompt);

    return propertyService.searchProperties(
            criteria.getLocation(),
            criteria.getBedrooms(),
            criteria.getMinPrice(),
            criteria.getMaxPrice(),
            criteria.getPropertyType(),
            "createdAt",
            "desc",
            0
    );
}

}
