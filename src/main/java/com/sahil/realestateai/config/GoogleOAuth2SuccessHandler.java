
package com.sahil.realestateai.config;

import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
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

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oauth2User =
                (OAuth2User) authentication.getPrincipal();

        String email = oauth2User.getAttribute("email");
        String firstName = oauth2User.getAttribute("given_name");
        String lastName = oauth2User.getAttribute("family_name");

        if (email == null || email.isBlank()) {
            response.sendError(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Google account email is unavailable"
            );
            return;
        }

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User();

                    newUser.setEmail(email);
                    newUser.setFirstName(
                            firstName != null ? firstName : "Google"
                    );
                    newUser.setLastName(
                            lastName != null ? lastName : "User"
                    );
                    newUser.setPassword(
                            passwordEncoder.encode(
                                    UUID.randomUUID().toString()
                            )
                    );
                    newUser.setRole(Role.CUSTOMER);

                    return userRepository.save(newUser);
                });

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole().name()
        );

        // Redirect to React with the JWT in the URL fragment.
        // Fragments are not sent to the backend in HTTP requests.
        String redirectUrl = frontendUrl
                + "/oauth2/callback#token="
                + java.net.URLEncoder.encode(
                        token,
                        java.nio.charset.StandardCharsets.UTF_8
                );

        response.sendRedirect(redirectUrl);
    }
}
