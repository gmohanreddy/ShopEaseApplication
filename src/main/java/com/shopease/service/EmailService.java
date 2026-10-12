package com.shopease.service;

import com.shopease.config.AppProperties;
import com.shopease.entity.Order;
import com.shopease.entity.OrderItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final AppProperties appProperties;

    public void sendOrderConfirmation(Order order) {
        String toEmail = order.getUser().getEmail();

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(appProperties.getSupportEmail());
            message.setTo(toEmail);
            message.setSubject("ShopEase - Order Confirmation #" + order.getOrderId());
            message.setText(buildEmailBody(order));

            mailSender.send(message);
            log.info("Confirmation email sent to {} for order #{}",
                    toEmail, order.getOrderId());

        } catch (Exception ex) {
            // Email failure NEVER breaks order placement
            // Order is already saved — we just log and move on
            log.error("Failed to send email for order #{} to {}: {}",
                    order.getOrderId(), toEmail, ex.getMessage());
        }
    }

    private String buildEmailBody(Order order) {
        StringBuilder sb = new StringBuilder();

        sb.append("Hi ").append(order.getUser().getName()).append(",\n\n");
        sb.append("Thank you for shopping with ")
          .append(appProperties.getName()).append("!\n\n");
        sb.append("Order ID : #").append(order.getOrderId()).append("\n");
        sb.append("Status   : ").append(order.getStatus()).append("\n");
        sb.append("Date     : ").append(order.getOrderDate()).append("\n\n");
        sb.append("─────────────────────────────\n");
        sb.append("Items Ordered:\n");
        sb.append("─────────────────────────────\n");

        BigDecimal total = BigDecimal.ZERO;

        for (OrderItem item : order.getOrderItems()) {
            BigDecimal subtotal = item.getPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()));
            total = total.add(subtotal);

            sb.append("• ").append(item.getProduct().getName()).append("\n")
              .append("  Qty : ").append(item.getQuantity()).append("\n")
              .append("  Rate: Rs.").append(item.getPrice()).append("\n")
              .append("  Sub : Rs.").append(subtotal).append("\n\n");
        }

        sb.append("─────────────────────────────\n");
        sb.append("Total Amount: Rs.").append(total).append("\n\n");
        sb.append("For support contact: ")
          .append(appProperties.getSupportEmail()).append("\n\n");
        sb.append("Thank you!\n");
        sb.append("Team ").append(appProperties.getName());

        return sb.toString();
    }
}