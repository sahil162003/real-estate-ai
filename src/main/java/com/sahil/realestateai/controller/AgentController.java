package com.sahil.realestateai.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sahil.realestateai.dto.InquiryResponseDto;
import com.sahil.realestateai.dto.PropertyResponseDto;
import com.sahil.realestateai.entity.InquiryStatus;
import com.sahil.realestateai.service.InquiryService;
import com.sahil.realestateai.service.PropertyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/agent")
@RequiredArgsConstructor
public class AgentController {
	private final PropertyService propertyService;
	private final InquiryService inquiryService;
	
	@GetMapping("/test")
	public String test() {
		return "Agent API is working fine";
	}
	
	@GetMapping("/getproperties")
	public List<PropertyResponseDto> getAllProperties() {
		
		return propertyService.getMyProperties();
	}
	
	@GetMapping("/inquiries")
	public List<InquiryResponseDto> getAgentInquiries() {

	    return inquiryService.getAgentInquiries();
	}
	
	@PutMapping("/inquiries/{inquiryId}/status")
	public InquiryResponseDto updateInquiryStatus(
	        @PathVariable Long inquiryId,
	        @RequestParam InquiryStatus status) {

	    return inquiryService.updateInquiryStatus(
	            inquiryId,
	            status
	    );
	}

}
