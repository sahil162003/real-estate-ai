package com.sahil.realestateai.mapper;

import org.mapstruct.Mapper;

import com.sahil.realestateai.dto.PropertyRequestDto;
import com.sahil.realestateai.dto.PropertyResponseDto;
import com.sahil.realestateai.dto.UserRegisterDto;
import com.sahil.realestateai.property.Property;
import com.sahil.realestateai.user.User;

@Mapper(componentModel = "spring")
public interface PropertyMapper {

	 Property toEntity(PropertyRequestDto request);

	    PropertyResponseDto toResponse(Property property);
	    
	    User toUserEntity(UserRegisterDto request);
}
