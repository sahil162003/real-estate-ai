package com.sahil.realestateai.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.sahil.realestateai.dto.LoginDto;
import com.sahil.realestateai.dto.UserRegisterDto;
import com.sahil.realestateai.dto.UserResponseDto;
import com.sahil.realestateai.entity.User;
import com.sahil.realestateai.exception.EmailAlreadyExistsException;
import com.sahil.realestateai.exception.InvalidCredentials;
import com.sahil.realestateai.mapper.UserMapper;
import com.sahil.realestateai.repository.UserRepository;
import com.sahil.realestateai.config.JwtService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
	
	private final UserRepository userRepository;
    private final UserMapper userMapper;	
    private final PasswordEncoder passwordEncoder;
    private final JwtService JwtService;
    
	public UserResponseDto createUser( UserRegisterDto user) {
		
		if(userRepository.existsByEmail(user.getEmail())) {
			throw new EmailAlreadyExistsException("Email already exists");
		}
		
		User p=userMapper.toEntity(user);
		
		p.setPassword(passwordEncoder.encode(user.getPassword()));
	User saveduser=	userRepository.save(p);
		
		
		return userMapper.toResponse(saveduser);
	}
	public  String loginUser(@Valid LoginDto loginDto) {
		
		User user = userRepository.findByEmail(loginDto.getEmail())
		        .orElseThrow(() -> new InvalidCredentials("Invalid email or passwod"));	
		
		if(!passwordEncoder.matches(loginDto.getPassword(), user.getPassword())) {
			throw new InvalidCredentials("Invalid email or password");
		}
		
		return JwtService.generateToken(user.getEmail(),user.getRole().name()); 
	}


}
