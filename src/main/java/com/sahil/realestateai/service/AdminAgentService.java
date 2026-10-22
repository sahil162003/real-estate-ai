
package com.sahil.realestateai.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sahil.realestateai.dto.AdminAgentResponseDto;
import com.sahil.realestateai.entity.Role;
import com.sahil.realestateai.entity.User;
import com.sahil.realestateai.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminAgentService {

    private final UserRepository userRepository;

    public List<AdminAgentResponseDto> getAllAgents() {
        return userRepository.findAllByRole(Role.AGENT)
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    private AdminAgentResponseDto convertToDto(User user) {
        AdminAgentResponseDto dto = new AdminAgentResponseDto();

        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setAddress(user.getAddress());
        dto.setCreatedAt(user.getCreatedAt());

        return dto;
    }
}
