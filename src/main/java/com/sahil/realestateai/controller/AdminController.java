package com.sahil.realestateai.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sahil.realestateai.dto.AgentApplicationResponseDto;
import com.sahil.realestateai.dto.InquiryResponseDto;
import com.sahil.realestateai.entity.InquiryStatus;
import com.sahil.realestateai.service.AgentApplicationService;
import com.sahil.realestateai.service.InquiryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
	private final AgentApplicationService agentApplicationService;
    private final InquiryService inquiryService;
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
	
	@GetMapping("/inquiries")
	public List<InquiryResponseDto> getAllInquiries() {

	    return inquiryService.getAllInquiries();
	}
	
	@GetMapping("/inquiries/{inquiryId}")
	public InquiryResponseDto getInquiryById(
	        @PathVariable Long inquiryId) {

	    return inquiryService.getInquiryByIdForAdmin(inquiryId);
	}
	
	@PutMapping("/inquiries/{inquiryId}/status")
	public InquiryResponseDto updateInquiryStatus(
	        @PathVariable Long inquiryId,
	        @RequestParam InquiryStatus status) {

	    return inquiryService.updateInquiryStatusByAdmin(
	            inquiryId,
	            status
	    );
	}
}
