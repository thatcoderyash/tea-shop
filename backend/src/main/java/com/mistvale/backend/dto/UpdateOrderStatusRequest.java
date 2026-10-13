
package com.mistvale.backend.dto;

import com.mistvale.backend.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(
        @NotNull OrderStatus status
) {}
