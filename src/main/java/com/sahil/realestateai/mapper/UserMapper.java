package com.sahil.realestateai.mapper;

import org.mapstruct.Mapper;

import com.sahil.realestateai.dto.UserRegisterDto;
import com.sahil.realestateai.dto.UserResponseDto;
import com.sahil.realestateai.entity.User;

@Mapper(componentModel = "spring")

public interface UserMapper {
	
	User toEntity(UserRegisterDto request);

	UserResponseDto toResponse(User user);

}
