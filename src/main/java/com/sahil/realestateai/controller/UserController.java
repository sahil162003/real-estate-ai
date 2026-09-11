package com.sahil.realestateai.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sahil.realestateai.dto.UserRegisterDto;
import com.sahil.realestateai.dto.UserResponseDto;
import com.sahil.realestateai.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor

public class UserController {
	
	private final UserService userService;
	
	@PostMapping("/register")
	public UserResponseDto createUser( @Valid @RequestBody UserRegisterDto user) {
		return userService.createUser(user);
	}
	
	
	

}
