package com.sahil.realestateai.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sahil.realestateai.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {


     boolean existsByEmail(String email);

	
}
