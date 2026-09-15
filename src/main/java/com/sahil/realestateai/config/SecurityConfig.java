package com.sahil.realestateai.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

	
	private final JwtAuthFilter jwtAuthFilter;
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
	
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
	    http.csrf(c->c.disable())
	    .sessionManagement(session ->
	    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
	)
	        .authorizeHttpRequests(requests -> requests
	        .requestMatchers("/api/users/register").permitAll()
	        .requestMatchers("/api/users/login").permitAll()
	        .anyRequest().authenticated())
	    
	    .addFilterBefore(
	            jwtAuthFilter,
	            UsernamePasswordAuthenticationFilter.class
	        );
	    return http.build();
	}
}
