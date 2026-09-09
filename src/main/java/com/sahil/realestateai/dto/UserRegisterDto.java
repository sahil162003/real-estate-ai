package com.sahil.realestateai.dto;

import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserRegisterDto {

	@NotBlank
	@Size(min = 2, max = 50)
	private String firstName;
	
	@NotBlank
	@Size(min = 2, max = 50)
	private String lastName;
	
	@NotBlank
	@Email
	private String email;
	
	@NotBlank
	@Size(min = 8, max = 100)
	private String password;
	
	@NotBlank
	@Pattern(regexp = "^[6-9]\\d{9}$")
	private String phoneNumber;
	
	@NotBlank
	@Size(max = 255)
	private String address;
	
}
