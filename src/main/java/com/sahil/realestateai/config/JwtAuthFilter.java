
package com.sahil.realestateai.config;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();

        // Public endpoints that do not require JWT processing
        if (path.equals("/api/users/login")
                || path.equals("/api/users/register")
                || path.startsWith("/api/images/")
                || path.equals("/api/images")
                || path.startsWith("/oauth2/")
                || path.startsWith("/login/oauth2/")) {

            filterChain.doFilter(request, response);
            return;
        }

        // Get Authorization header
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null) {
            sendUnauthorized(response, "Authentication token is required");
            return;
        }

        if (!authHeader.startsWith("Bearer ")) {
            sendUnauthorized(response, "Invalid Authorization header");
            return;
        }

        String jwt = authHeader.substring(7);

        if (jwt.isBlank()) {
            sendUnauthorized(response, "JWT token is required");
            return;
        }

        try {
            String username = jwtService.extractUsername(jwt);

            UserDetails userDetails =
                    userDetailsService.loadUserByUsername(username);

            if (jwtService.validateToken(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities());

                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request));

                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);
            } else {
                sendUnauthorized(response, "Invalid JWT token");
                return;
            }

        } catch (ExpiredJwtException e) {
            sendUnauthorized(response, "JWT token has expired");
            return;

        } catch (Exception e) {
            sendUnauthorized(response, "Invalid JWT token");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void sendUnauthorized(
            HttpServletResponse response,
            String message) throws IOException {

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        response.getWriter().write(
                "{"
                + "\"status\":401,"
                + "\"error\":\"Unauthorized\","
                + "\"message\":\"" + message + "\""
                + "}");
    }
}
