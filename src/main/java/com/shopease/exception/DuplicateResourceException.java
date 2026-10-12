package com.shopease.exception;

// Thrown when trying to create something that violates a unique constraint
// e.g. duplicate category name, duplicate user email.
// Mapped to HTTP 409 CONFLICT by GlobalExceptionHandler.
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}