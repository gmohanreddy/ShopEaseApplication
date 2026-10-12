package com.shopease.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;

    // This field only appears in JSON when validation fails (@Valid)
    // @JsonInclude(NON_NULL) means: skip this field if it's null
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Map<String, String> validationErrors;
}