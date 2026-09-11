package com.sahil.realestateai.dto;

import java.time.LocalDateTime;

import com.sahil.realestateai.entity.Role;

import lombok.Data;

@Data
public class UserResponseDto {

    private Long id;

    private String firstName;

    private String lastName;

    private String email;

    private String phoneNumber;

    private Role role;

    private String address;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}