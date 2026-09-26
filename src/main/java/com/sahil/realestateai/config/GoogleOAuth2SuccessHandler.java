package com.sahil.realestateai.config;

import java.io.IOException;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.sahil.realestateai.entity.Role;
import com.sahil.realestateai.entity.User;
import com.sahil.realestateai.repository.UserRepository;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class GoogleOAuth2SuccessHandler
        extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication)
            throws IOException, ServletException {

        // Get authenticated Google user
        OAuth2User oauth2User =
                (OAuth2User) authentication.getPrincipal();

        // Get Google user information
        String email = oauth2User.getAttribute("email");
        String firstName = oauth2User.getAttribute("given_name");
        String lastName = oauth2User.getAttribute("family_name");

        // Find existing user or create a new user
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {

                    User newUser = new User();

                    newUser.setEmail(email);

                    newUser.setFirstName(
                            firstName != null
                                    ? firstName
                                    : "Google"
                    );

                    newUser.setLastName(
                            lastName != null
                                    ? lastName
                                    : "User"
                    );

                    /*
                     * Google users don't provide a password.
                     * Generate a random encoded password so that
                     * the User entity validation is satisfied.
                     */
                    newUser.setPassword(
                            passwordEncoder.encode(
                                    UUID.randomUUID().toString()
                            )
                    );

                    // New Google users are CUSTOMER by default
                    newUser.setRole(Role.CUSTOMER);

                    return userRepository.save(newUser);
                });

        /*
         * Generate your application's JWT
         * using the existing JwtService.
         */
        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole().name()
        );

        /*
         * Return JWT to the client.
         */
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        response.getWriter().write(
                "{\"token\":\"" + token + "\"}"
        );
    }
}