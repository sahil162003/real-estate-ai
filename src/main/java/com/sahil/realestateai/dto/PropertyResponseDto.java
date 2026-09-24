package com.sahil.realestateai.dto;

import java.time.LocalDateTime;

import com.sahil.realestateai.entity.PropertyType;

import lombok.Data;

@Data
public class PropertyResponseDto {
    private Long id;
    
	private String title;
	
	private  String location;
	
	private Double price;
	
	private Integer bedrooms;
	
	private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
private String description;
	
	private Integer bathrooms;
	
	private Double area;
	
	private PropertyType propertyType;

}
