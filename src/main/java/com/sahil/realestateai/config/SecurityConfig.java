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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    private final CustomAuthenticationEntryPoint
            customAuthenticationEntryPoint;

    private final CustomAccessDeniedHandler
            customAccessDeniedHandler;
    
    private final GoogleOAuth2SuccessHandler
    googleOAuth2SuccessHandler;

    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of("http://localhost:5173")
        );

        configuration.setAllowedMethods(
                List.of("GET", "POST","PATCH", "PUT", "DELETE", "OPTIONS")
        );

        configuration.setAllowedHeaders(
                List.of("Authorization", "Content-Type", "Accept")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
  

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

            // Disable CSRF because this is a REST API
        .cors(cors -> {})
        .csrf(csrf -> csrf.disable())

            // OAuth2 login needs a session during the login process.
            // JWT authentication remains used for your APIs.
            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.IF_REQUIRED
                )
            )

            // Disable normal HTTP Basic authentication
            .httpBasic(basic -> basic.disable())

            // Disable normal form login
            .formLogin(form -> form.disable())

            // Authorization rules
            .authorizeHttpRequests(auth -> auth

            		// Public endpoints
            		.requestMatchers(
            		    "/api/users/register",
            		    "/api/users/login",
            		    "/api/images/**",
            		    "/oauth2/**",
            		    "/login/oauth2/**",
            		    "/error"
            		).permitAll()

                // Admin only
                .requestMatchers("/api/admin/**")
                .hasRole("ADMIN")

                // Agent + Admin
                .requestMatchers("/api/agent/**")
                .hasAnyRole(
                    "AGENT",
                    "ADMIN"
                )

                // Customer + Agent + Admin
                .requestMatchers("/api/customer/**")
                .hasAnyRole(
                    "CUSTOMER",
                    "AGENT",
                    "ADMIN"
                )

                // GET properties
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/properties/**"
                )
                .hasAnyRole(
                    "CUSTOMER",
                    "AGENT",
                    "ADMIN"
                )

                // POST properties
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/properties/**"
                )
                .hasAnyRole(
                    "AGENT",
                    "ADMIN"
                )

                // PUT properties
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/properties/**"
                )
                .hasAnyRole(
                    "AGENT",
                    "ADMIN"
                )

                // DELETE properties
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/properties/**"
                )
                .hasAnyRole(
                    "AGENT",
                    "ADMIN"
                )

                // Everything else requires authentication
                .anyRequest()
                .authenticated()
            )

            // 401 and 403 handling
            .exceptionHandling(exception -> exception

                // Not authenticated -> 401
                .authenticationEntryPoint(
                    customAuthenticationEntryPoint
                )

                // Authenticated but insufficient permission -> 403
                .accessDeniedHandler(
                    customAccessDeniedHandler
                )
            )

            // Google OAuth2 login
            .oauth2Login(oauth2 -> oauth2
            	    .loginPage("/oauth2/authorization/google")
            	    .successHandler(googleOAuth2SuccessHandler)
            	)

            // JWT filter
            .addFilterBefore(
                jwtAuthFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}