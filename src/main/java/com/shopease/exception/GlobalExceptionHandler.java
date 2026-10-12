package com.shopease.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.authorization.AuthorizationDeniedException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 404 - resource not found
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex,
            HttpServletRequest request) {

        log.error("Resource not found: {}", ex.getMessage());
        return new ResponseEntity<>(
                buildError(HttpStatus.NOT_FOUND, ex.getMessage(), request, null),
                HttpStatus.NOT_FOUND);
    }

    // 409 - duplicate resource
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateResource(
            DuplicateResourceException ex,
            HttpServletRequest request) {

        log.error("Duplicate resource: {}", ex.getMessage());
        return new ResponseEntity<>(
                buildError(HttpStatus.CONFLICT, ex.getMessage(), request, null),
                HttpStatus.CONFLICT);
    }

    // 409 - insufficient stock
    @ExceptionHandler(InsufficientStockException.class)
    public ResponseEntity<ErrorResponse> handleInsufficientStock(
            InsufficientStockException ex,
            HttpServletRequest request) {

        log.error("Insufficient stock: {}", ex.getMessage());
        return new ResponseEntity<>(
                buildError(HttpStatus.CONFLICT, ex.getMessage(), request, null),
                HttpStatus.CONFLICT);
    }
    
 // 403 - @PreAuthorize rejected the request (wrong role)
    @ExceptionHandler(AuthorizationDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAuthorizationDenied(
            AuthorizationDeniedException ex,
            HttpServletRequest request) {

        log.error("Access denied at {}: {}", request.getRequestURI(), ex.getMessage());

        ErrorResponse error = buildError(
                HttpStatus.FORBIDDEN,
                "Access Denied - You do not have permission to perform this action",
                request,
                null);

        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    // 401 - wrong password during login
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(
            BadCredentialsException ex,
            HttpServletRequest request) {

        log.error("Bad credentials for: {}", request.getRequestURI());
        return new ResponseEntity<>(
                buildError(HttpStatus.UNAUTHORIZED,
                        "Invalid email or password", request, null),
                HttpStatus.UNAUTHORIZED);
    }

    // 401 - other Spring Security auth failures
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(
            AuthenticationException ex,
            HttpServletRequest request) {

        log.error("Authentication failed: {}", ex.getMessage());
        return new ResponseEntity<>(
                buildError(HttpStatus.UNAUTHORIZED,
                        "Authentication failed: " + ex.getMessage(), request, null),
                HttpStatus.UNAUTHORIZED);
    }

    // 400 - @Valid failures
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        log.error("Validation failed: {}", fieldErrors);
        return new ResponseEntity<>(
                buildError(HttpStatus.BAD_REQUEST, "Validation failed",
                        request, fieldErrors),
                HttpStatus.BAD_REQUEST);
    }

    // 500 - catch-all
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex,
            HttpServletRequest request) {

        log.error("Unexpected error at {}: {}", request.getRequestURI(),
                ex.getMessage(), ex);
        return new ResponseEntity<>(
                buildError(HttpStatus.INTERNAL_SERVER_ERROR,
                        "An unexpected error occurred. Please try again later.",
                        request, null),
                HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private ErrorResponse buildError(HttpStatus status, String message,
                                     HttpServletRequest request,
                                     Map<String, String> validationErrors) {
        return ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(request.getRequestURI())
                .validationErrors(validationErrors)
                .build();
    }
}