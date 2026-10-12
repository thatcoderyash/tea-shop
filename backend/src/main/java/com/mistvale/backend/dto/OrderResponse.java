package com.mistvale.backend.dto;

import com.mistvale.backend.entity.Order;

import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        String trackingToken,
        double subtotal,
        double discount,
        double shipping,
        double total,
        LocalDateTime createdAt,
        List<OrderItemResponse> items
) {
    public static OrderResponse from(Order order) {
        List<OrderItemResponse> items = order.getItems()
                .stream()
                .map(item -> new OrderItemResponse(
                        item.getProductId(),
                        item.getProductName(),
                        item.getPrice(),
                        item.getQuantity()
                ))
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getTrackingToken(),
                order.getSubtotal(),
                order.getDiscount(),
                order.getShipping(),
                order.getTotal(),
                order.getCreatedAt(),
                items
        );
    }

    public record OrderItemResponse(
            Long productId,
            String productName,
            double price,
            int quantity
    ) {
    }
}
