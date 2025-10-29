package com.farm.marketplace.dto;

import com.farm.marketplace.model.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusUpdateRequest {
    
    @NotNull(message = "Status is required")
    private OrderStatus status;
}
