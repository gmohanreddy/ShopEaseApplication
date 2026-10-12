package com.shopease.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {

    private Long itemId;
    private Long productId;
    private String productName;
    private Integer quantity;
    private BigDecimal price;       // price at time of purchase (snapshot)
    private BigDecimal subtotal;    // price x quantity — computed in service
}