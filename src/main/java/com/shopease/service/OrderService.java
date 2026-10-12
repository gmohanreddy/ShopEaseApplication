package com.shopease.service;

import com.shopease.dto.OrderItemRequest;
import com.shopease.dto.OrderItemResponse;
import com.shopease.dto.OrderRequest;
import com.shopease.dto.OrderResponse;
import com.shopease.entity.Order;
import com.shopease.entity.OrderItem;
import com.shopease.entity.Product;
import com.shopease.entity.User;
import com.shopease.entity.enums.OrderStatus;
import com.shopease.exception.InsufficientStockException;
import com.shopease.exception.ResourceNotFoundException;
import com.shopease.repository.OrderRepository;
import com.shopease.repository.ProductRepository;
import com.shopease.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService;  // injected here

    @Transactional
    public OrderResponse placeOrder(OrderRequest request) {
        log.info("Placing order for userId: {}", request.getUserId());

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> {
                    log.error("User not found with id: {}", request.getUserId());
                    return new ResourceNotFoundException(
                            "User not found with id: " + request.getUserId());
                });

        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PENDING)
                .orderItems(new ArrayList<>())
                .build();

        List<OrderItem> orderItems = new ArrayList<>();

        for (OrderItemRequest itemRequest : request.getItems()) {

            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> {
                        log.error("Product not found with id: {}",
                                itemRequest.getProductId());
                        return new ResourceNotFoundException(
                                "Product not found with id: "
                                        + itemRequest.getProductId());
                    });

            if (product.getStock() < itemRequest.getQuantity()) {
                log.warn("Insufficient stock for '{}': requested={}, available={}",
                        product.getName(), itemRequest.getQuantity(),
                        product.getStock());
                throw new InsufficientStockException(
                        "Insufficient stock for '" + product.getName()
                        + "'. Available: " + product.getStock()
                        + ", Requested: " + itemRequest.getQuantity());
            }

            product.setStock(product.getStock() - itemRequest.getQuantity());
            productRepository.save(product);
            log.debug("Stock deducted for '{}', remaining: {}",
                    product.getName(), product.getStock());

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .price(product.getPrice())
                    .build();

            orderItems.add(orderItem);
        }

        order.setOrderItems(orderItems);
        Order saved = orderRepository.save(order);
        log.info("Order #{} placed for user '{}' with {} item(s)",
                saved.getOrderId(), user.getName(), orderItems.size());

        // Called AFTER save — orderId is available, order is committed
        // EmailService catches its own exceptions so this never breaks the order
        emailService.sendOrderConfirmation(saved);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrderHistory(Long userId) {
        log.debug("Fetching order history for userId: {}", userId);

        if (!userRepository.existsById(userId)) {
            log.error("User not found with id: {}", userId);
            throw new ResourceNotFoundException(
                    "User not found with id: " + userId);
        }

        return orderRepository.findByUserUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId) {
        log.debug("Fetching order id: {}", orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> {
                    log.error("Order not found with id: {}", orderId);
                    return new ResourceNotFoundException(
                            "Order not found with id: " + orderId);
                });
        return mapToResponse(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        log.info("Updating order #{} status to {}", orderId, newStatus);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> {
                    log.error("Order not found with id: {}", orderId);
                    return new ResourceNotFoundException(
                            "Order not found with id: " + orderId);
                });

        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);
        log.info("Order #{} status updated to {}", orderId, newStatus);
        return mapToResponse(updated);
    }

    private OrderResponse mapToResponse(Order order) {

        List<OrderItemResponse> itemResponses = order.getOrderItems()
                .stream()
                .map(item -> {
                    BigDecimal subtotal = item.getPrice()
                            .multiply(BigDecimal.valueOf(item.getQuantity()));
                    return OrderItemResponse.builder()
                            .itemId(item.getItemId())
                            .productId(item.getProduct().getProductId())
                            .productName(item.getProduct().getName())
                            .quantity(item.getQuantity())
                            .price(item.getPrice())
                            .subtotal(subtotal)
                            .build();
                })
                .collect(Collectors.toList());

        BigDecimal totalAmount = itemResponses.stream()
                .map(OrderItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .userId(order.getUser().getUserId())
                .userName(order.getUser().getName())
                .orderDate(order.getOrderDate())
                .status(order.getStatus())
                .totalAmount(totalAmount)
                .items(itemResponses)
                .build();
    }
}