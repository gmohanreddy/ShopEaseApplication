package com.shopease.repository;

import com.shopease.entity.Order;
import com.shopease.entity.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserUserId(Long userId);

    List<Order> findByStatus(OrderStatus status);
}