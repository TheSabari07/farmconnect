package com.farm.marketplace.controller;

import com.farm.marketplace.dto.DeliveryCreateRequest;
import com.farm.marketplace.dto.DeliveryResponse;
import com.farm.marketplace.dto.DeliveryStatusUpdateRequest;
import com.farm.marketplace.exception.ResourceNotFoundException;
import com.farm.marketplace.model.Product;
import com.farm.marketplace.model.User;
import com.farm.marketplace.repository.OrderRepository;
import com.farm.marketplace.repository.ProductRepository;
import com.farm.marketplace.repository.UserRepository;
import com.farm.marketplace.service.DeliveryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/delivery")
public class DeliveryController {
    
    @Autowired
    private DeliveryService deliveryService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    /**
     * Create delivery entry for an order (Farmer/Admin only)
     */
    @PostMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
    public ResponseEntity<?> createDelivery(
            @PathVariable Long orderId,
            @RequestBody(required = false) DeliveryCreateRequest request,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Farmers can only create delivery for their own products
            if (user.getRole().name().equals("FARMER")) {
                var order = orderRepository.findById(orderId)
                        .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
                var product = productRepository.findById(order.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
                
                if (!product.getFarmerId().equals(user.getId())) {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "You can only create delivery for your own products");
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
                }
            }
            
            DeliveryResponse delivery = deliveryService.createDelivery(orderId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(delivery);
            
        } catch (ResourceNotFoundException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    /**
     * Get delivery details by order ID
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getDeliveryByOrderId(@PathVariable Long orderId) {
        try {
            DeliveryResponse delivery = deliveryService.getDeliveryByOrderId(orderId);
            return ResponseEntity.ok(delivery);
        } catch (ResourceNotFoundException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    /**
     * Update delivery status (Farmer/Admin only)
     */
    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
    public ResponseEntity<?> updateDeliveryStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody DeliveryStatusUpdateRequest request,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Farmers can only update delivery for their own products
            if (user.getRole().name().equals("FARMER")) {
                var order = orderRepository.findById(orderId)
                        .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
                var product = productRepository.findById(order.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
                
                if (!product.getFarmerId().equals(user.getId())) {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "You can only update delivery for your own products");
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
                }
            }
            
            DeliveryResponse delivery = deliveryService.updateDeliveryStatus(orderId, request);
            return ResponseEntity.ok(delivery);
            
        } catch (ResourceNotFoundException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    /**
     * Get all deliveries for a buyer (Buyer only - their own deliveries)
     */
    @GetMapping("/tracking/{buyerId}")
    public ResponseEntity<?> getDeliveriesForBuyer(
            @PathVariable Long buyerId,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Buyers can only view their own deliveries, admins can view any
            if (user.getRole().name().equals("BUYER") && !user.getId().equals(buyerId)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "You can only view your own deliveries");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            List<DeliveryResponse> deliveries = deliveryService.getDeliveriesForBuyer(buyerId);
            return ResponseEntity.ok(deliveries);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    /**
     * Get all deliveries for a farmer (Farmer only - their own deliveries)
     */
    @GetMapping("/farmer/{farmerId}")
    @PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
    public ResponseEntity<?> getDeliveriesForFarmer(
            @PathVariable Long farmerId,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Farmers can only view their own deliveries, admins can view any
            if (user.getRole().name().equals("FARMER") && !user.getId().equals(farmerId)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "You can only view your own deliveries");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            List<DeliveryResponse> deliveries = deliveryService.getDeliveriesForFarmer(farmerId);
            return ResponseEntity.ok(deliveries);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    /**
     * Get all deliveries (Admin only)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DeliveryResponse>> getAllDeliveries() {
        List<DeliveryResponse> deliveries = deliveryService.getAllDeliveries();
        return ResponseEntity.ok(deliveries);
    }
}
