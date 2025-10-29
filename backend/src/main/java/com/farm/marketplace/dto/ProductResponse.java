package com.farm.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private Integer quantity;
    private String location;
    private Long farmerId;
    private String farmerName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
