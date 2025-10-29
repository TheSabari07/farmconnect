package com.farm.marketplace.dto;

import com.farm.marketplace.model.DeliveryStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryResponse {
    private Long id;
    private Long orderId;
    private Long farmerId;
    private String farmerName;
    private Long buyerId;
    private String buyerName;
    private String productName;
    private DeliveryStatus deliveryStatus;
    private LocalDate estimatedDeliveryDate;
    private LocalDate actualDeliveryDate;
    private String trackingLocation;
    private String deliveryNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
