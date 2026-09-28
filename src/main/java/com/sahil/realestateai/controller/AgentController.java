package com.sahil.realestateai.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sahil.realestateai.dto.PropertyResponseDto;
import com.sahil.realestateai.service.PropertyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/agent")
@RequiredArgsConstructor
public class AgentController {
	private final PropertyService propertyService;
	
	@GetMapping("/test")
	public String test() {
		return "Agent API is working fine";
	}
	
	@GetMapping("/getproperties")
	public List<PropertyResponseDto> getAllProperties() {
		
		return propertyService.getMyProperties();
	}

}
