
package com.mistvale.backend.controller;

import com.mistvale.backend.dto.AdminOrderResponse;
import com.mistvale.backend.dto.UpdateOrderStatusRequest;
import com.mistvale.backend.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public List<AdminOrderResponse> getAllOrders() {
        return orderService.getAllOrders()
                .stream()
                .map(AdminOrderResponse::from)
                .toList();
    }

    @PatchMapping("/{id}/status")
    public AdminOrderResponse updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        return AdminOrderResponse.from(
                orderService.updateOrderStatus(id, request.status())
        );
    }
}
