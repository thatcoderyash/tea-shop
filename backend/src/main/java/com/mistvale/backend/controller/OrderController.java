
package com.mistvale.backend.controller;

import com.mistvale.backend.dto.CreateOrderRequest;
import com.mistvale.backend.dto.OrderResponse;
import com.mistvale.backend.dto.OrderTrackingResponse;
import com.mistvale.backend.entity.Order;
import com.mistvale.backend.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createOrder(
            @Valid @RequestBody CreateOrderRequest request
    ) {
        return OrderResponse.from(orderService.createOrder(request));
    }

    @GetMapping("/{id}")
    public OrderTrackingResponse getOrder(
            @PathVariable Long id,
            @RequestParam String token
    ) {
        Order order = orderService.getOrderForTracking(id, token);
        return OrderTrackingResponse.from(order);
    }
}
