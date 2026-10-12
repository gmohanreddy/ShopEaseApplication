package com.shopease.exception;

// Thrown when any entity (User, Product, Category, Order)
// is requested but doesn't exist in the database.
// Mapped to HTTP 404 NOT FOUND by GlobalExceptionHandler.
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}