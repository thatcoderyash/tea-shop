package com.mistvale.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateOrderRequest(
        @NotBlank @Size(max = 100) String customerName,
        @NotBlank @Email @Size(max = 150) String email,
        @NotBlank @Pattern(regexp = "^[0-9+() -]{7,20}$") String phone,
        @NotBlank @Size(max = 300) String address,
        @NotBlank @Size(max = 100) String city,
        @NotBlank @Size(max = 100) String state,
        @NotBlank @Pattern(regexp = "^[0-9]{6}$") String pincode,
        @Size(max = 30) String couponCode,
        @NotEmpty List<@Valid OrderItemRequest> items
) {}