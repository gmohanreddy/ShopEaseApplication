package com.shopease.service;

import com.shopease.repository.SecurityUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

// UserDetailsService is a Spring Security interface with ONE method:
// loadUserByUsername(String username)
// Spring Security calls this automatically during authentication.
// It passes the email the user typed in the login request,
// and expects back a UserDetails object (our SecurityUser implements this).
@Slf4j
@Service
@RequiredArgsConstructor
public class SecurityUserService implements UserDetailsService {

    private final SecurityUserRepository securityUserRepository;

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        log.debug("Loading user by email: {}", email);

        // If user not found, throw UsernameNotFoundException
        // Spring Security catches this and returns 401 Unauthorized automatically
        return securityUserRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("User not found with email: {}", email);
                    return new UsernameNotFoundException(
                            "User not found with email: " + email);
                });
    }
}