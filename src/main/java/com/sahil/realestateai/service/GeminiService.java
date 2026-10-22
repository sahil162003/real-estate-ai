
package com.sahil.realestateai.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sahil.realestateai.dto.AiPropertySearchRequestDto;

@Service
public class GeminiService {

    @Value("${gemini.api.url}")
    private String apiUrl;

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String testGemini(String prompt) {

        return callGemini(prompt);
    }

    public AiPropertySearchRequestDto extractPropertySearchCriteria(
            String userQuery) {

        if (userQuery == null || userQuery.isBlank()) {
            throw new IllegalArgumentException(
                    "Property search query cannot be empty");
        }

        String prompt = """
                You are a property-search criteria extraction assistant.

                Extract search criteria from the user's real-estate query.
                Return ONLY a valid JSON object with these fields:
                {
                  "location": string or null,
                  "bedrooms": integer or null,
                  "minPrice": number or null,
                  "maxPrice": number or null,
                  "propertyType": string or null
                }

                Rules:
                - Prices must be in Indian rupees as numeric values.
                - Convert 80 lakh to 8000000.
                - Convert 1 crore to 10000000.
                - If the user says "under" a budget, set maxPrice.
                - Do not invent criteria the user did not specify.
                - Use propertyType values such as APARTMENT, HOUSE, VILLA,
                  or PLOT when supported by the query.
                - If a field is not specified, return null.
                - Do not include Markdown or code fences.

                User query: %s
                """.formatted(userQuery.trim());

        String response = callGemini(prompt);

        try {
            String json = extractJson(response);

            AiPropertySearchRequestDto criteria =
                    objectMapper.readValue(
                            json,
                            AiPropertySearchRequestDto.class);

            validateCriteria(criteria);

            return criteria;

        } catch (IllegalArgumentException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalStateException(
                    "Could not parse Gemini property-search criteria",
                    ex);
        }
    }

    private String callGemini(String prompt) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", apiKey);

        Map<String, Object> requestBody = Map.of(
                "contents", new Object[] {
                        Map.of(
                                "parts", new Object[] {
                                        Map.of("text", prompt)
                                }
                        )
                }
        );

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(requestBody, headers);

        Map<?, ?> response = restTemplate.exchange(
                apiUrl,
                HttpMethod.POST,
                request,
                Map.class
        ).getBody();

        if (response == null) {
            throw new IllegalStateException(
                    "Gemini returned an empty response");
        }

        Object candidatesObject = response.get("candidates");

        if (!(candidatesObject instanceof List<?> candidates)
                || candidates.isEmpty()) {
            throw new IllegalStateException(
                    "Gemini returned no candidates");
        }

        Object contentObject =
                ((Map<?, ?>) candidates.get(0)).get("content");

        if (!(contentObject instanceof Map<?, ?> content)) {
            throw new IllegalStateException(
                    "Gemini response has no content");
        }

        Object partsObject = content.get("parts");

        if (!(partsObject instanceof List<?> parts)
                || parts.isEmpty()
                || !(parts.get(0) instanceof Map<?, ?> part)
                || part.get("text") == null) {
            throw new IllegalStateException(
                    "Gemini response has no text");
        }

        return String.valueOf(part.get("text"));
    }

    private String extractJson(String response) {

        String cleaned = response.trim();

        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceFirst(
                    "^```(?:json)?\\s*", "");
            cleaned = cleaned.replaceFirst("\\s*```$", "");
        }

        int start = cleaned.indexOf('{');
        int end = cleaned.lastIndexOf('}');

        if (start < 0 || end < start) {
            throw new IllegalStateException(
                    "Gemini did not return a valid JSON object");
        }

        return cleaned.substring(start, end + 1);
    }

    private void validateCriteria(
            AiPropertySearchRequestDto criteria) {

        if (criteria.getBedrooms() != null
                && (criteria.getBedrooms() < 0
                || criteria.getBedrooms() > 100)) {
            throw new IllegalArgumentException(
                    "Invalid bedroom count returned by AI");
        }

        if (criteria.getMinPrice() != null
                && criteria.getMinPrice() < 0) {
            throw new IllegalArgumentException(
                    "Minimum price cannot be negative");
        }

        if (criteria.getMaxPrice() != null
                && criteria.getMaxPrice() < 0) {
            throw new IllegalArgumentException(
                    "Maximum price cannot be negative");
        }

        if (criteria.getMinPrice() != null
                && criteria.getMaxPrice() != null
                && criteria.getMinPrice() > criteria.getMaxPrice()) {
            throw new IllegalArgumentException(
                    "Minimum price cannot exceed maximum price");
        }

        if (criteria.getLocation() != null
                && criteria.getLocation().length() > 150) {
            throw new IllegalArgumentException(
                    "Location is too long");
        }

        if (criteria.getPropertyType() != null
                && criteria.getPropertyType().length() > 50) {
            throw new IllegalArgumentException(
                    "Property type is too long");
        }
    }
}
