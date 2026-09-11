package com.sahil.realestateai.service;

import org.springframework.stereotype.Service;

import com.sahil.realestateai.dto.UserRegisterDto;
import com.sahil.realestateai.dto.UserResponseDto;
import com.sahil.realestateai.entity.User;
import com.sahil.realestateai.exception.EmailAlreadyExistsException;
import com.sahil.realestateai.mapper.PropertyMapper;
import com.sahil.realestateai.mapper.UserMapper;
import com.sahil.realestateai.repository.UserRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
	
	private final UserRepository userRepository;
    private final UserMapper userMapper;	

	public UserResponseDto createUser( UserRegisterDto user) {
		
		if(userRepository.existsByEmail(user.getEmail())) {
			throw new EmailAlreadyExistsException("Email already exists");
		}
		
		User p=userMapper.toEntity(user);
	User saveduser=	userRepository.save(p);
		
		
		return userMapper.toResponse(saveduser);
	}
	

}
