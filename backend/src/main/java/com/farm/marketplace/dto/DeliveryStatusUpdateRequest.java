package com.farm.marketplace.dto;

import com.farm.marketplace.model.DeliveryStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryStatusUpdateRequest {
    
    @NotNull(message = "Delivery status is required")
    private DeliveryStatus status;
    
    private String trackingLocation;
    
    private String deliveryNotes;
}
