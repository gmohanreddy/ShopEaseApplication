package com.shopease.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

// Binds app.name and app.support-email from application.properties
// into this class automatically.
// Relaxed binding: app.support-email → getSupportEmail() (kebab → camelCase)
@Component
@ConfigurationProperties(prefix = "app")
@Data
public class AppProperties {

    private String name;
    private String supportEmail;
}