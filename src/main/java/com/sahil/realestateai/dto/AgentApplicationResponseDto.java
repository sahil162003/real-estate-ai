package com.sahil.realestateai.dto;

import java.time.LocalDateTime;

import com.sahil.realestateai.entity.AgentApplicationStatus;

import lombok.Data;

@Data
public class AgentApplicationResponseDto {

    private Long id;

    private Long userId;

    private String userName;

    private String email;

    private String reason;

    private AgentApplicationStatus status;

    private LocalDateTime appliedAt;

    private LocalDateTime reviewedAt;

    private String adminComment;
}