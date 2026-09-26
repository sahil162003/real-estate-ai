package com.sahil.realestateai.entity;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@NotBlank
	@Size(min = 2, max = 50)
	private String firstName;
	
	@NotBlank
	@Size(min = 2, max = 50)
	private String lastName;
	
	@NotBlank
	@Email
	@Column(unique = true, nullable = false)
	private String email;
	
	@NotBlank
	@Size(min = 8, max = 100)
	private String password;
	
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Role role= Role.CUSTOMER;
	

	@Pattern(regexp = "^[6-9]\\d{9}$")
	private String phoneNumber;
	
	
	@Size(max = 255)
	private String address;
	
	
	
	@CreationTimestamp
	private LocalDateTime createdAt;
	
	@UpdateTimestamp

	private LocalDateTime updatedAt;

	

}
