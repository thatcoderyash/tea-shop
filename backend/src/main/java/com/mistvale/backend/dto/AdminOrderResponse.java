
package com.mistvale.backend.dto;

import com.mistvale.backend.entity.Order;
import com.mistvale.backend.entity.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;

public record AdminOrderResponse(
        Long id,
        String customerName,
        String email,
        String phone,
        String address,
        String city,
        String state,
        String pincode,
        OrderStatus status,
        double subtotal,
        double discount,
        double shipping,
        double total,
        LocalDateTime createdAt,
        List<OrderResponse.OrderItemResponse> items
) {
    public static AdminOrderResponse from(Order order) {
        List<OrderResponse.OrderItemResponse> items =
                order.getItems().stream()
                        .map(item ->
                                new OrderResponse.OrderItemResponse(
                                        item.getProductId(),
                                        item.getProductName(),
                                        item.getPrice(),
                                        item.getQuantity()
                                )
                        )
                        .toList();

        return new AdminOrderResponse(
                order.getId(),
                order.getCustomerName(),
                order.getEmail(),
                order.getPhone(),
                order.getAddress(),
                order.getCity(),
                order.getState(),
                order.getPincode(),
                order.getStatus(),
                order.getSubtotal(),
                order.getDiscount(),
                order.getShipping(),
                order.getTotal(),
                order.getCreatedAt(),
                items
        );
    }
}
