
package com.sahil.realestateai.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sahil.realestateai.dto.AdminCustomerResponseDto;
import com.sahil.realestateai.dto.AgentApplicationResponseDto;
import com.sahil.realestateai.dto.InquiryResponseDto;
import com.sahil.realestateai.entity.InquiryStatus;
import com.sahil.realestateai.service.AdminAgentService;
import com.sahil.realestateai.service.AdminCustomerService;
import com.sahil.realestateai.service.AgentApplicationService;
import com.sahil.realestateai.service.InquiryService;
import com.sahil.realestateai.dto.AdminAgentResponseDto;
import com.sahil.realestateai.service.AdminAgentService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AgentApplicationService agentApplicationService;
    private final InquiryService inquiryService;
    private final AdminCustomerService adminCustomerService;
    private final AdminAgentService adminAgentService;
    @GetMapping("/test")
    public String test() {
        return "Admin API is working fine";
    }

    // Get all agent applications
    @GetMapping("/getApplication")
    public List<AgentApplicationResponseDto> getApplication() {
        return agentApplicationService.getAllApplications();
    }

    // Approve an agent application
    @PostMapping("/approveApplication/{applicationId}")
    public AgentApplicationResponseDto approveApplication(
            @PathVariable Long applicationId) {
        return agentApplicationService.approveApplication(applicationId);
    }

    // Reject an agent application
    @PostMapping("/rejectApplication/{applicationId}")
    public AgentApplicationResponseDto rejectApplication(
            @PathVariable Long applicationId) {
        return agentApplicationService.rejectApplication(applicationId);
    }

    // Get all registered customers
    @GetMapping("/customers")
    public List<AdminCustomerResponseDto> getAllCustomers() {
        return adminCustomerService.getAllCustomers();
    }

    // Get all inquiries
    @GetMapping("/inquiries")
    public List<InquiryResponseDto> getAllInquiries() {
        return inquiryService.getAllInquiries();
    }

    // Get a specific inquiry
    @GetMapping("/inquiries/{inquiryId}")
    public InquiryResponseDto getInquiryById(
            @PathVariable Long inquiryId) {
        return inquiryService.getInquiryByIdForAdmin(inquiryId);
    }

    // Update inquiry status
    @PutMapping("/inquiries/{inquiryId}/status")
    public InquiryResponseDto updateInquiryStatus(
            @PathVariable Long inquiryId,
            @RequestParam InquiryStatus status) {
        return inquiryService.updateInquiryStatusByAdmin(
                inquiryId,
                status
        );
    }
    @GetMapping("/agents")
    public List<AdminAgentResponseDto> getAllAgents() {
        return adminAgentService.getAllAgents();
    }
}
