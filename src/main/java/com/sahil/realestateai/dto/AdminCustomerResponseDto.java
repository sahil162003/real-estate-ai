
package com.sahil.realestateai.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class AdminCustomerResponseDto {

    private Long id;

    private String firstName;

    private String lastName;

    private String email;

    private String phoneNumber;

    private String address;

    private LocalDateTime createdAt;
}
