package com.shopease.exception;

// Thrown during order placement when requested quantity
// exceeds available product stock.
// Mapped to HTTP 409 CONFLICT by GlobalExceptionHandler.
public class InsufficientStockException extends RuntimeException {

    public InsufficientStockException(String message) {
        super(message);
    }
}