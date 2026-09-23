
package com.sahil.realestateai.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.sahil.realestateai.exception.CustomAccessDeniedHandler;
import com.sahil.realestateai.exception.CustomAuthenticationEntryPoint;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    private final CustomAuthenticationEntryPoint
            customAuthenticationEntryPoint;

    private final CustomAccessDeniedHandler
            customAccessDeniedHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            // Disable CSRF because this is a stateless REST API
            .csrf(csrf -> csrf.disable())

            // JWT authentication is stateless
            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            // Disable browser-based authentication
            .httpBasic(basic -> basic.disable())
            .formLogin(form -> form.disable())

            // Authorization rules
            .authorizeHttpRequests(auth -> auth

                // Public endpoints
                .requestMatchers(
                    "/api/users/register",
                    "/api/users/login",
                    "/error"
                ).permitAll()

                // Admin only
                .requestMatchers("/api/admin/**")
                .hasRole("ADMIN")

                // Agent + Admin
                .requestMatchers("/api/agent/**")
                .hasAnyRole("AGENT", "ADMIN")

                // Customer + Agent + Admin
                .requestMatchers("/api/customer/**")
                .hasAnyRole(
                    "CUSTOMER",
                    "AGENT",
                    "ADMIN"
                )
                .requestMatchers(HttpMethod.GET, "/api/properties/**")
                .hasAnyRole("CUSTOMER", "AGENT", "ADMIN")

            .requestMatchers(HttpMethod.POST, "/api/properties/**")
                .hasAnyRole("AGENT", "ADMIN")

            .requestMatchers(HttpMethod.PUT, "/api/properties/**")
                .hasAnyRole("AGENT", "ADMIN")

            .requestMatchers(HttpMethod.DELETE, "/api/properties/**")
                .hasAnyRole("AGENT", "ADMIN")
                

                // Everything else requires authentication
                .anyRequest()
                .authenticated()
            )

            // 401 and 403 handling
            .exceptionHandling(exception -> exception

                // Not authenticated → 401
                .authenticationEntryPoint(
                    customAuthenticationEntryPoint
                )

                // Authenticated but insufficient role → 403
                .accessDeniedHandler(
                    customAccessDeniedHandler
                )
            )

            // JWT filter
            .addFilterBefore(
                jwtAuthFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}
