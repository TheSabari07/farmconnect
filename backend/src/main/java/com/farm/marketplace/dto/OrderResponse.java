package com.farm.marketplace.dto;

import com.farm.marketplace.model.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private Long productId;
    private String productName;
    private Long buyerId;
    private String buyerName;
    private Long farmerId;
    private String farmerName;
    private Integer quantity;
    private Double totalPrice;
    private OrderStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
