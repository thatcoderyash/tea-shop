package com.mistvale.backend.controller;

import com.mistvale.backend.entity.CustomerAccount;
import com.mistvale.backend.repository.CustomerAccountRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.mistvale.backend.dto.CustomerOrderResponse;
import com.mistvale.backend.entity.Order;
import com.mistvale.backend.service.OrderService;

import java.util.List;

import java.util.Map;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    private final CustomerAccountRepository customerAccountRepository;
    private final OrderService orderService;

    public CustomerController(CustomerAccountRepository customerAccountRepository, OrderService orderService) {
        this.customerAccountRepository = customerAccountRepository;
        this.orderService = orderService;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {

        CustomerAccount customer = customerAccountRepository
                .findByEmailIgnoreCase(authentication.getName())
                .orElse(null);

        if (customer == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Customer account not found");
        }

        Map<String, String> profile = Map.of(
                "name", customer.getName(),
                "email", customer.getEmail()
        );

        return ResponseEntity.ok(profile);
    }

    @GetMapping("/orders")
    public ResponseEntity<List<CustomerOrderResponse>> getCustomerOrders(
            Authentication authentication) {

        List<Order> orders =
                orderService.getCustomerOrders(authentication.getName());

        List<CustomerOrderResponse> response = orders.stream()
                .map(CustomerOrderResponse::from)
                .toList();

        return ResponseEntity.ok(response);
    }
}