package com.sahil.realestateai.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sahil.realestateai.dto.AgentApplicationResponseDto;
import com.sahil.realestateai.service.AgentApplicationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
	private final AgentApplicationService agentApplicationService;

	@GetMapping("/test")
	public String test() {
		return "Admin API is working fine";
	}
	
	@GetMapping("/getApplication")
	public List<AgentApplicationResponseDto> getApplication() {
		
		return agentApplicationService.getAllApplications();
	}
	
	@PostMapping("/approveApplication/{applicationId}")
	public AgentApplicationResponseDto approveApplication(@PathVariable Long applicationId) {
		return agentApplicationService.approveApplication(applicationId);
	}
	
	@PostMapping("/rejectApplication/{applicationId}")
	public AgentApplicationResponseDto rejectApplication(@PathVariable Long applicationId) {
		return agentApplicationService.rejectApplication(applicationId);
	}
}
