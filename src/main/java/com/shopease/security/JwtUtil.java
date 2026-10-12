package com.shopease.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Date;

// @Component makes this a Spring-managed bean so it can be
// injected anywhere with @Autowired or constructor injection
@Slf4j
@Component
public class JwtUtil {

    // Reads jwt.secret from application.properties
    // This is the private key used to SIGN tokens — keep it secret!
    @Value("${jwt.secret}")
    private String secret;

    // Reads jwt.expiration-ms from application.properties
    // 86400000 = 24 hours in milliseconds
    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    // ── 1. GENERATE TOKEN ──────────────────────────────────────

    // Called during login — builds and signs a JWT token for the user
    public String generateToken(UserDetails userDetails) {

        // Algorithm.HMAC256 uses your secret key with the HS256 algorithm
        // HS256 = HMAC + SHA-256 — the most common JWT signing algorithm
        Algorithm algorithm = Algorithm.HMAC256(secret);

        String token = JWT.create()
                // subject = who this token belongs to (the user's email)
                .withSubject(userDetails.getUsername())
                // issuedAt = when was this token created
                .withIssuedAt(new Date())
                // expiresAt = when does this token stop being valid
                .withExpiresAt(new Date(System.currentTimeMillis() + expirationMs))
                // claim = extra data embedded in the token
                // we store the role so we can read it without a DB call
                .withClaim("role", userDetails.getAuthorities()
                        .iterator().next().getAuthority())
                // sign() locks the token with your secret key
                // any tampering with the token will invalidate this signature
                .sign(algorithm);

        log.debug("Generated JWT token for user: {}", userDetails.getUsername());
        return token;
    }

    // ── 2. EXTRACT EMAIL FROM TOKEN ────────────────────────────

    // Called on every request — reads who the token belongs to
    public String extractEmail(String token) {
        return decodeToken(token).getSubject();
    }

    // ── 3. VALIDATE TOKEN ──────────────────────────────────────

    // Called on every request — checks:
    // (a) signature is valid (wasn't tampered with)
    // (b) token hasn't expired
    // (c) token belongs to this user
    public boolean validateToken(String token, UserDetails userDetails) {
        try {
            String email = extractEmail(token);

            boolean isEmailMatch = email.equals(userDetails.getUsername());
            boolean isNotExpired = !isTokenExpired(token);

            log.debug("Token validation for {}: emailMatch={}, notExpired={}",
                    email, isEmailMatch, isNotExpired);

            return isEmailMatch && isNotExpired;

        } catch (JWTVerificationException ex) {
            // Thrown when signature is invalid or token is malformed
            log.error("JWT validation failed: {}", ex.getMessage());
            return false;
        }
    }

    // ── PRIVATE HELPERS ────────────────────────────────────────

    private boolean isTokenExpired(String token) {
        Date expiration = decodeToken(token).getExpiresAt();
        return expiration.before(new Date());
    }

    // Decodes and VERIFIES the token signature in one step.
    // If the token was tampered with, verify() throws JWTVerificationException.
    // If the token is expired, verify() also throws JWTVerificationException.
    private DecodedJWT decodeToken(String token) {
        Algorithm algorithm = Algorithm.HMAC256(secret);

        JWTVerifier verifier = JWT.require(algorithm).build();

        // This line does all the heavy lifting:
        // 1. Decodes the Base64 token
        // 2. Re-computes the signature using your secret
        // 3. Compares it to the signature in the token
        // 4. Checks the expiry date
        // Throws JWTVerificationException if anything is wrong
        return verifier.verify(token);
    }
}