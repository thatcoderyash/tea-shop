package com.mistvale.backend.dto;

import com.mistvale.backend.entity.Order;
import com.mistvale.backend.entity.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;

public record OrderTrackingResponse(
        Long id,
        OrderStatus status,
        double subtotal,
        double discount,
        double shipping,
        double total,
        LocalDateTime createdAt,
        List<OrderResponse.OrderItemResponse> items
) {
    public static OrderTrackingResponse from(Order order) {
        OrderResponse response = OrderResponse.from(order);

        return new OrderTrackingResponse(
                order.getId(),
                order.getStatus(),
                response.subtotal(),
                response.discount(),
                response.shipping(),
                response.total(),
                response.createdAt(),
                response.items()
        );
    }
}
