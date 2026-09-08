package com.sahil.realestateai.dto;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ErrorResponseDto {

	  private String path;
	    private HttpStatus status;
	    private String message;
	    private LocalDateTime timestamp;
}