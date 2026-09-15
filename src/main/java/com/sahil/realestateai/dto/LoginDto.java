package com.sahil.realestateai.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginDto {
	
	@Email(message = "Email should be valid")
	@NotBlank(message = "Email cannot be blank")
	private String email;
	
	@NotBlank(message = "Password cannot be blank")
	private String password;

}
