package com.farm.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryCreateRequest {
    private LocalDate estimatedDeliveryDate;
    private String trackingLocation;
    private String deliveryNotes;
}
