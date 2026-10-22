
package com.sahil.realestateai.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sahil.realestateai.dto.AdminCustomerResponseDto;
import com.sahil.realestateai.entity.Role;
import com.sahil.realestateai.entity.User;
import com.sahil.realestateai.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminCustomerService {

    private final UserRepository userRepository;

    public List<AdminCustomerResponseDto> getAllCustomers() {
        return userRepository.findAllByRole(Role.CUSTOMER)
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    private AdminCustomerResponseDto convertToDto(User user) {
        AdminCustomerResponseDto dto = new AdminCustomerResponseDto();

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
