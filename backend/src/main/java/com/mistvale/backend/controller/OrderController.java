package com.mistvale.backend.controller;

import com.mistvale.backend.dto.CreateOrderRequest;
import com.mistvale.backend.dto.OrderResponse;
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
        Order order = orderService.createOrder(request);
        return OrderResponse.from(order);
    }

    @GetMapping("/{id}")
    public OrderResponse getOrder(@PathVariable Long id) {
        Order order = orderService.getOrder(id);
        return OrderResponse.from(order);
    }
}