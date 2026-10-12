package com.shopease.security;

import com.shopease.service.SecurityUserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// OncePerRequestFilter guarantees this filter runs EXACTLY ONCE
// per HTTP request — even if the request is forwarded internally.
// Every single request passes through this filter before reaching
// any controller.
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final SecurityUserService securityUserService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // Step 1 — Read the Authorization header
        // Every protected request must have this header:
        // Authorization: Bearer eyJhbGci...
        final String authHeader = request.getHeader("Authorization");

        // Step 2 — If header is missing or doesn't start with "Bearer ",
        // skip JWT processing and pass request to the next filter.
        // SecurityConfig will then reject it with 401 if the route is protected.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.debug("No Bearer token found for request: {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        // Step 3 — Extract the token (remove "Bearer " prefix — 7 characters)
        final String token = authHeader.substring(7);

        // Step 4 — Extract email from token
        final String email;
        try {
            email = jwtUtil.extractEmail(token);
        } catch (Exception ex) {
            // Token is malformed or signature is invalid
            log.error("Failed to extract email from token: {}", ex.getMessage());
            filterChain.doFilter(request, response);
            return;
        }

        // Step 5 — If email was extracted AND user is not already authenticated
        // SecurityContextHolder.getContext().getAuthentication() == null means
        // this request has not been authenticated yet in this thread
        if (email != null &&
                SecurityContextHolder.getContext().getAuthentication() == null) {

            // Step 6 — Load the user from the database
            UserDetails userDetails =
                    securityUserService.loadUserByUsername(email);

            // Step 7 — Validate the token against the loaded user
            if (jwtUtil.validateToken(token, userDetails)) {

                // Step 8 — Create an authentication object
                // UsernamePasswordAuthenticationToken is Spring Security's
                // standard way to represent an authenticated user.
                // Constructor: (principal, credentials, authorities)
                // credentials = null because we don't need the password anymore
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                // Step 9 — Attach request details (IP, session) to auth token
                authToken.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );

                // Step 10 — Store authentication in SecurityContext
                // This is what tells Spring Security "this request is authenticated"
                // Any @PreAuthorize or security check later reads from here
                SecurityContextHolder.getContext().setAuthentication(authToken);

                log.debug("Authenticated user: {} for URI: {}",
                        email, request.getRequestURI());
            } else {
                log.warn("Invalid JWT token for user: {}", email);
            }
        }

        // Step 11 — Pass request to the next filter / controller
        filterChain.doFilter(request, response);
    }
}