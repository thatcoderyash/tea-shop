package com.mistvale.backend.dto;

import com.mistvale.backend.entity.Order;
import com.mistvale.backend.entity.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;

public record CustomerOrderResponse(
        Long id,
        LocalDateTime createdAt,
        OrderStatus status,
        double total,
        List<OrderResponse.OrderItemResponse> items
) {
    public static CustomerOrderResponse from(Order order) {
        List<OrderResponse.OrderItemResponse> items =
                order.getItems()
                        .stream()
                        .map(item -> new OrderResponse.OrderItemResponse(
                                item.getProductId(),
                                item.getProductName(),
                                item.getPrice(),
                                item.getQuantity()
                        ))
                        .toList();

        return new CustomerOrderResponse(
                order.getId(),
                order.getCreatedAt(),
                order.getStatus(),
                order.getTotal(),
                items
        );
    }
}