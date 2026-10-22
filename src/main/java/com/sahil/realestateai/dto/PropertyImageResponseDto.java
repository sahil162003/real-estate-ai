
package com.sahil.realestateai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyImageResponseDto {

    private Long id;
    private String imageUrl;
}
