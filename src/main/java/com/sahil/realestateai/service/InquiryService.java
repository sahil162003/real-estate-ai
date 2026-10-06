package com.sahil.realestateai.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.sahil.realestateai.dto.InquiryResponseDto;
import com.sahil.realestateai.entity.InquiryStatus;
import com.sahil.realestateai.entity.Property;
import com.sahil.realestateai.entity.PropertyInquiry;
import com.sahil.realestateai.entity.PropertyStatus;
import com.sahil.realestateai.entity.User;
import com.sahil.realestateai.exception.InquiryNotFoundException;
import com.sahil.realestateai.exception.InvalidInquiryStatusException;
import com.sahil.realestateai.exception.PropertyInquiryNotAllowedException;
import com.sahil.realestateai.exception.PropertyNotFoundException;
import com.sahil.realestateai.exception.UnauthorizedInquiryException;
import com.sahil.realestateai.exception.UserNotFoundException;
import com.sahil.realestateai.repository.InquiryRepository;
import com.sahil.realestateai.repository.PropertyRepository;
import com.sahil.realestateai.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InquiryService {
	
	private final InquiryRepository inquiryRepository;
	private final UserRepository userRepository;
	private final PropertyRepository propertyReposittory;
	

	public  InquiryResponseDto propertyInquiry(Long propertyId,String connect) {
		
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		String name = auth.getName();
		
		User user = userRepository.findByEmail(name).orElseThrow(() ->new UserNotFoundException("user not found"));
		
		Property property = propertyReposittory.findById(propertyId).orElseThrow(() ->new PropertyNotFoundException("Propert not found"));
		
		if (property.getStatus() != PropertyStatus.AVAILABLE) {
		    throw new PropertyInquiryNotAllowedException(
		            "Inquiry cannot be created for a "
		            + property.getStatus()
		            + " property"
		    );
		}
		
		PropertyInquiry propertyInquiry = new PropertyInquiry();
		
		propertyInquiry.setProperty(property);
		propertyInquiry.setMessage(connect);
		propertyInquiry.setCustomer(user);
		propertyInquiry.setStatus(InquiryStatus.PENDING);
		
		PropertyInquiry save = inquiryRepository.save(propertyInquiry);
		return convertToResponse(save);
	}
	 private InquiryResponseDto convertToResponse(
	            PropertyInquiry inquiry) {

	        InquiryResponseDto response =
	                new InquiryResponseDto();

	        User customer = inquiry.getCustomer();

	        response.setId(inquiry.getId());

	        response.setCustomerId(customer.getId());

	        response.setCustomerName(
	                customer.getFirstName()
	                        + " "
	                        + customer.getLastName()
	        );

	        response.setCustomerEmail(
	                customer.getEmail()
	        );

	        response.setPropertyId(
	                inquiry.getProperty().getId()
	        );

	        response.setMessage(
	                inquiry.getMessage()
	        );

	        response.setStatus(
	                inquiry.getStatus()
	        );

	        response.setCreatedAt(
	                inquiry.getCreatedAt()
	        );

	        response.setContactedAt(
	                inquiry.getContactedAt()
	        );

	        response.setClosedAt(
	                inquiry.getClosedAt()
	        );

	        return response;
	    }
	 
	 public List<InquiryResponseDto> getInquiries() {
		 
		 
		 Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		           String name = auth.getName();
		           User byEmail = userRepository.findByEmail(name).orElseThrow(()->new UserNotFoundException("user not found"));
		 List<PropertyInquiry> inquiries = inquiryRepository.findByCustomer(byEmail);
		 
		return inquiries.stream().map(this::convertToResponse).toList();
	 }
	 
	 public InquiryResponseDto getInquiry(Long inquiryId) {
		  Authentication auth =
		            SecurityContextHolder.getContext().getAuthentication();

		    String email = auth.getName();

		    User user = userRepository.findByEmail(email)
		            .orElseThrow(() ->
		                    new UserNotFoundException("User not found"));

		    PropertyInquiry inquiry =
		            inquiryRepository.findById(inquiryId)
		                    .orElseThrow(() ->
		                            new InquiryNotFoundException("Inquiry not found"));

		    if (!inquiry.getCustomer().getId().equals(user.getId())) {

		        throw new UnauthorizedInquiryException(
		                "You are not authorized to view this inquiry");
		    }

		    return convertToResponse(inquiry);
	 }
	 
	 public List<InquiryResponseDto> getAgentInquiries() {

		    Authentication auth =
		            SecurityContextHolder
		                    .getContext()
		                    .getAuthentication();

		    String email = auth.getName();

		    User agent = userRepository.findByEmail(email)
		            .orElseThrow(() ->
		                    new UserNotFoundException("User not found"));

		    List<PropertyInquiry> inquiries =
		            inquiryRepository.findByPropertyOwner(agent);

		    return inquiries.stream()
		            .map(this::convertToResponse)
		            .toList();
		}
	 
	 public InquiryResponseDto updateInquiryStatus(
		        Long inquiryId,
		        InquiryStatus newStatus) {

		    Authentication auth =
		            SecurityContextHolder
		                    .getContext()
		                    .getAuthentication();

		    String email = auth.getName();

		    User agent = userRepository.findByEmail(email)
		            .orElseThrow(() ->
		                    new UserNotFoundException("User not found"));

		    PropertyInquiry inquiry =
		            inquiryRepository.findById(inquiryId)
		                    .orElseThrow(() ->
		                            new InquiryNotFoundException("Inquiry not found"));

		    // Check that this inquiry belongs to
		    // a property owned by the logged-in agent
		    if (!inquiry.getProperty()
		            .getOwner()
		            .getId()
		            .equals(agent.getId())) {

		        throw new UnauthorizedInquiryException(
		                "You are not authorized to update this inquiry");
		    }
		    

		    validateStatusTransition(
		            inquiry.getStatus(),
		            newStatus
		    );

		    // Update status
		    inquiry.setStatus(newStatus);

		    if (newStatus == InquiryStatus.CONTACTED) {

		        if (inquiry.getContactedAt() == null) {
		            inquiry.setContactedAt(LocalDateTime.now());
		        }
		    }

		    if (newStatus == InquiryStatus.CLOSED) {

		        if (inquiry.getClosedAt() == null) {
		            inquiry.setClosedAt(LocalDateTime.now());
		        }
		    }

		    PropertyInquiry save =
		            inquiryRepository.save(inquiry);

		    return convertToResponse(save);
		}
	 
	 public List<InquiryResponseDto> getAllInquiries() {

		    List<PropertyInquiry> inquiries =
		            inquiryRepository.findAll();

		    return inquiries.stream()
		            .map(this::convertToResponse)
		            .toList();
		}
	 
	 public InquiryResponseDto getInquiryByIdForAdmin(Long inquiryId) {

		    PropertyInquiry inquiry =
		            inquiryRepository.findById(inquiryId)
		                    .orElseThrow(() ->
		                            new InquiryNotFoundException("Inquiry not found"));

		    return convertToResponse(inquiry);
		}
	 
	 public InquiryResponseDto updateInquiryStatusByAdmin(
		        Long inquiryId,
		        InquiryStatus newStatus) {

		    PropertyInquiry inquiry =
		            inquiryRepository.findById(inquiryId)
		                    .orElseThrow(() ->
		                            new InquiryNotFoundException("Inquiry not found"));
		    
		    validateStatusTransition(
		            inquiry.getStatus(),
		            newStatus
		    );

		    inquiry.setStatus(newStatus);

		    if (newStatus == InquiryStatus.CONTACTED
		            && inquiry.getContactedAt() == null) {

		        inquiry.setContactedAt(LocalDateTime.now());
		    }

		    if (newStatus == InquiryStatus.CLOSED
		            && inquiry.getClosedAt() == null) {

		        inquiry.setClosedAt(LocalDateTime.now());
		    }

		    PropertyInquiry saved =
		            inquiryRepository.save(inquiry);

		    return convertToResponse(saved);
		}
	 
	 private void validateStatusTransition(
		        InquiryStatus current,
		        InquiryStatus next) {

		    if (current == InquiryStatus.PENDING
		            && next == InquiryStatus.CONTACTED) {
		        return;
		    }

		    if (current == InquiryStatus.CONTACTED
		            && next == InquiryStatus.CLOSED) {
		        return;
		    }

		    throw new InvalidInquiryStatusException(
		            "Invalid status transition: "
		            + current + " → " + next);
		}

}
