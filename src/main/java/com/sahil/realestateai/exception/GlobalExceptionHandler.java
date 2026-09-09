package com.sahil.realestateai.exception;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import com.sahil.realestateai.dto.ErrorResponseDto;

@RestControllerAdvice
public class GlobalExceptionHandler {
	
	@ExceptionHandler(PropertyNotFoundException.class)
	public ResponseEntity<ErrorResponseDto> handledPropertyNotFound(PropertyNotFoundException ex,WebRequest webRequest) {
		       ErrorResponseDto er=new ErrorResponseDto(
		    		   webRequest.getDescription(false),
		    		    HttpStatus.BAD_REQUEST,
		    		    ex.getMessage(),
		    		    LocalDateTime.now()
		    		    );
		return new ResponseEntity<>(er,HttpStatus.BAD_REQUEST);
	}
	
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponseDto> handleValidationException(
	        MethodArgumentNotValidException exception,
	        WebRequest webRequest) {

	    String message = exception.getBindingResult()
	            .getFieldErrors()
	            .stream()
	            .map(error -> error.getField() + ": " + error.getDefaultMessage())
	            .collect(Collectors.joining(", "));

	    ErrorResponseDto response = new ErrorResponseDto(
	            webRequest.getDescription(false),
	            HttpStatus.BAD_REQUEST,
	            message,
	            LocalDateTime.now()
	    );

	    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
	}
	
	@ExceptionHandler(EmailAlreadyExistsException.class)
	public ResponseEntity<ErrorResponseDto> handledPropertyNotFound(EmailAlreadyExistsException ex,WebRequest webRequest) {
		       ErrorResponseDto er=new ErrorResponseDto(
		    		   webRequest.getDescription(false),
		    		    HttpStatus.BAD_REQUEST,
		    		    ex.getMessage(),
		    		    LocalDateTime.now()
		    		    );
		return new ResponseEntity<>(er,HttpStatus.BAD_REQUEST);
	}

}
