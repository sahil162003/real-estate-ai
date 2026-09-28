package com.sahil.realestateai.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sahil.realestateai.entity.AgentApplication;
import com.sahil.realestateai.entity.AgentApplicationStatus;
import com.sahil.realestateai.entity.User;

public interface AgentApplicationRepository
        extends JpaRepository<AgentApplication, Long> {

    List<AgentApplication> findByUser(User user);

    Optional<AgentApplication> findByUserAndStatus(
            User user,
            AgentApplicationStatus status
    );

    List<AgentApplication> findByStatus(
            AgentApplicationStatus status
    );
}