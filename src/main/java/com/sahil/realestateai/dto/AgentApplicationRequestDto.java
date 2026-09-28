package com.sahil.realestateai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AgentApplicationRequestDto {

    @NotBlank
    @Size(min = 10, max = 1000)
    private String reason;
}