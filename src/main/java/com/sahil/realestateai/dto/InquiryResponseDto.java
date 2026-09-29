package com.sahil.realestateai.dto;

import java.time.LocalDateTime;

import com.sahil.realestateai.entity.InquiryStatus;

import lombok.Data;

@Data
public class InquiryResponseDto {

    private Long id;

    private Long customerId;

    private String customerName;

    private String customerEmail;

    private Long propertyId;

    private String message;

    private InquiryStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime contactedAt;

    private LocalDateTime closedAt;
}