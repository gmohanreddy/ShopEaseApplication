package com.shopease.dto;

import com.shopease.entity.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private Long orderId;
    private Long userId;
    private String userName;
    private LocalDateTime orderDate;
    private OrderStatus status;
    private BigDecimal totalAmount;     // sum of all item subtotals
    private List<OrderItemResponse> items;
}