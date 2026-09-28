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

        /*
         * Public authentication endpoints
         *
         * These endpoints do not require JWT.
         *
         * OAuth2 endpoints are also skipped because
         * Spring Security handles Google authentication.
         */
        if (path.equals("/api/users/login")
                || path.equals("/api/users/register")
                || path.startsWith("/oauth2/")
                || path.startsWith("/login/oauth2/")) {

            filterChain.doFilter(request, response);
            return;
        }

        /*
         * Get Authorization header
         */
        String authHeader = request.getHeader("Authorization");

        /*
         * No Authorization header
         */
        if (authHeader == null) {

            sendUnauthorized(
                    response,
                    "Authentication token is required"
            );

            return;
        }

        /*
         * Authorization header must use Bearer authentication
         */
        if (!authHeader.startsWith("Bearer ")) {

            sendUnauthorized(
                    response,
                    "Invalid Authorization header"
            );

            return;
        }

        /*
         * Extract JWT
         */
        String jwt = authHeader.substring(7);

        /*
         * Empty Bearer token
         */
        if (jwt.isBlank()) {

            sendUnauthorized(
                    response,
                    "JWT token is required"
            );

            return;
        }

        try {

            /*
             * Extract email from JWT
             */
            String username =
                    jwtService.extractUsername(jwt);

            System.out.println("========== JWT DEBUG ==========");
            System.out.println("JWT EMAIL = " + username);
            System.out.println("REQUEST = " + request.getRequestURI());

            /*
             * Load user from database
             */
            UserDetails userDetails =
                    userDetailsService
                            .loadUserByUsername(username);

            System.out.println(
                    "LOADED USER = "
                    + userDetails.getUsername()
            );

            System.out.println(
                    "AUTHORITIES = "
                    + userDetails.getAuthorities()
            );

            /*
             * Validate JWT
             */
            if (jwtService.validateToken(
                    jwt,
                    userDetails)) {

                /*
                 * Create authentication using
                 * the user represented by this JWT.
                 *
                 * This intentionally sets the JWT user
                 * into SecurityContext.
                 */
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(authentication);

                System.out.println(
                        "SECURITY CONTEXT USER = "
                        + SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                .getName()
                );
            }

            System.out.println("===============================");

        } catch (ExpiredJwtException e) {

            sendUnauthorized(
                    response,
                    "JWT token has expired"
            );

            return;

        } catch (Exception e) {

            sendUnauthorized(
                    response,
                    "Invalid JWT token"
            );

            return;
        }

        /*
         * Continue to controller / Spring Security
         */
        filterChain.doFilter(request, response);
    }

    /**
     * Sends a standard 401 Unauthorized response.
     */
    private void sendUnauthorized(
            HttpServletResponse response,
            String message)
            throws IOException {

        response.setStatus(
                HttpServletResponse.SC_UNAUTHORIZED
        );

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        response.getWriter().write(
                "{"
                + "\"status\":401,"
                + "\"error\":\"Unauthorized\","
                + "\"message\":\""
                + message
                + "\""
                + "}"
        );
    }
}