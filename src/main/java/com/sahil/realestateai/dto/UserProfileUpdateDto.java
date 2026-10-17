package com.sahil.realestateai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserProfileUpdateDto {

    @NotBlank(message = "Phone number is required")
    @Pattern(
        regexp = "^[6-9]\\d{9}$",
        message = "Enter a valid 10-digit Indian mobile number"
    )
    private String phoneNumber;

    @NotBlank(message = "Address is required")
    @Size(
        max = 255,
        message = "Address must not exceed 255 characters"
    )
    private String address;
}