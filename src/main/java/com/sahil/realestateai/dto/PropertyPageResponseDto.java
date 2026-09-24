package com.sahil.realestateai.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyPageResponseDto {

    private List<PropertyResponseDto> properties;

    private int page;

    private int size;

    private long totalElements;

    private int totalPages;

    private boolean last;
}