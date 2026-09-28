package com.sahil.realestateai.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sahil.realestateai.dto.AgentApplicationRequestDto;
import com.sahil.realestateai.dto.AgentApplicationResponseDto;
import com.sahil.realestateai.entity.AgentApplication;
import com.sahil.realestateai.entity.AgentApplicationStatus;
import com.sahil.realestateai.entity.Role;
import com.sahil.realestateai.entity.User;
import com.sahil.realestateai.repository.AgentApplicationRepository;
import com.sahil.realestateai.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AgentApplicationService {

private final UserRepository userRepository;
private final AgentApplicationRepository agentApplicationRepository;
	
	public AgentApplicationResponseDto applyForAgent(String email, AgentApplicationRequestDto reason) {
		
		User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("you are not a valid user"));
		
		System.out.println("User role: " + user.getRole());
		if(user.getRole()!=Role.CUSTOMER) {
			throw new RuntimeException("You are not  an customer");
		}
		Optional<AgentApplication> existingApplication =
                agentApplicationRepository.findByUserAndStatus(
                        user,
                        AgentApplicationStatus.PENDING);
		
		if(existingApplication.isPresent()) {
			throw new RuntimeException("You have already applied for agent");
		}
		AgentApplication agentApplication = new AgentApplication();
		agentApplication.setUser(user);
		agentApplication.setReason(reason.getReason());
		agentApplication.setStatus(AgentApplicationStatus.PENDING);
		AgentApplication save = agentApplicationRepository.save(agentApplication);
		
		return convertToResponse(save);
	}
	
	
	 private AgentApplicationResponseDto convertToResponse(
	            AgentApplication application) {

	        AgentApplicationResponseDto response =
	                new AgentApplicationResponseDto();

	        User user = application.getUser();

	        response.setId(application.getId());

	        response.setUserId(user.getId());

	        response.setUserName(
	                user.getFirstName() + " " + user.getLastName());

	        response.setEmail(user.getEmail());

	        response.setReason(application.getReason());

	        response.setStatus(application.getStatus());

	        response.setAppliedAt(application.getAppliedAt());

	        response.setReviewedAt(application.getReviewedAt());

	        response.setAdminComment(
	                application.getAdminComment());

	        return response;
	    }
	 
	 
	 public List<AgentApplicationResponseDto> getAllApplications() {
		 
		 List<AgentApplication> byStatus = agentApplicationRepository.findByStatus(AgentApplicationStatus.PENDING);
		
		 
		return byStatus.stream().map(this::convertToResponse).toList();
	 }

     @Transactional
	 public AgentApplicationResponseDto approveApplication(Long applicationId) {
		 
		 AgentApplication application = agentApplicationRepository.findById(applicationId).orElseThrow(() -> new RuntimeException("Application not found"));
		
		 if(application.getStatus()!=AgentApplicationStatus.PENDING) {
			 throw new RuntimeException("Application is not pending");
		 }
		 
		User user= application.getUser();
		user.setRole(Role.AGENT);
		userRepository.save(user);
		
		application.setStatus(AgentApplicationStatus.APPROVED);
		application.setReviewedAt(LocalDateTime.now());
		application.setAdminComment("Your application has been approved");
		AgentApplication save = agentApplicationRepository.save(application);
		 
		 
		 return convertToResponse(save);
	 }

     @Transactional
	 public AgentApplicationResponseDto rejectApplication(Long applicationId) {
    	  
		 AgentApplication application = agentApplicationRepository.findById(applicationId).orElseThrow(() -> new RuntimeException("Application not found"));
		
		 if(application.getStatus()!=AgentApplicationStatus.PENDING) {
			 throw new RuntimeException("Application is not pending");
		 }
		 
		 
		 application.setAdminComment("Your application has been rejected");
		 application.setReviewedAt(LocalDateTime.now());
		 application.setStatus(AgentApplicationStatus.REJECTED);
		 AgentApplication save = agentApplicationRepository.save(application);
		return convertToResponse(save);
	 }
     
     

	 
	 
}
