package com.sahil.realestateai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data

public class PropertyRequestDto {
	
    @NotBlank(message = "Title is required")
private String title;
	
    @NotBlank(message = "Location is required")

	private  String location;
	
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be greater than 0")
	private Double price;
	
    @NotNull(message = "Bedrooms is required")
    @PositiveOrZero(message = "Bedrooms cannot be negative")
	private Integer bedrooms;
}
