
package com.sahil.realestateai.dto;

import lombok.Data;

@Data
public class AiPropertySearchRequestDto {

    private String location;

    private Integer bedrooms;

    private Double minPrice;

    private Double maxPrice;

    private String propertyType;
}
