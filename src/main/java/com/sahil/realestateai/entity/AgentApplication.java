package com.sahil.realestateai.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Entity
@Data
public class AgentApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 1000)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AgentApplicationStatus status = AgentApplicationStatus.PENDING;

    @CreationTimestamp
    private LocalDateTime appliedAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime reviewedAt;

    @Column(length = 500)
    private String adminComment;
}