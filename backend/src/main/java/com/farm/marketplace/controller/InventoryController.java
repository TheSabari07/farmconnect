package com.farm.marketplace.controller;

import com.farm.marketplace.dto.InventoryResponse;
import com.farm.marketplace.dto.InventoryUpdateRequest;
import com.farm.marketplace.model.Product;
import com.farm.marketplace.model.User;
import com.farm.marketplace.repository.ProductRepository;
import com.farm.marketplace.repository.UserRepository;
import com.farm.marketplace.service.InventoryService;
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
@RequestMapping("/api/inventory")
public class InventoryController {
    
    @Autowired
    private InventoryService inventoryService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    /**
     * Get all inventory items (Farmer sees their own, Admin sees all)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
    public ResponseEntity<List<InventoryResponse>> getAllInventory(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<InventoryResponse> inventory;
        if (user.getRole().name().equals("ADMIN")) {
            inventory = inventoryService.getAllInventory();
        } else {
            // Farmers see only their own products' inventory
            inventory = inventoryService.getInventoryByFarmerId(user.getId());
        }
        
        return ResponseEntity.ok(inventory);
    }
    
    /**
     * Get inventory for a specific product
     */
    @GetMapping("/{productId}")
    public ResponseEntity<?> getInventoryByProductId(@PathVariable Long productId) {
        try {
            InventoryResponse inventory = inventoryService.getInventoryByProductId(productId);
            return ResponseEntity.ok(inventory);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    /**
     * Manually update inventory (Farmer/Admin only)
     * Farmers can only update their own products
     */
    @PutMapping("/update/{productId}")
    @PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
    public ResponseEntity<?> updateInventory(
            @PathVariable Long productId,
            @Valid @RequestBody InventoryUpdateRequest request,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Check if product exists
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            
            // Farmers can only update their own products
            if (user.getRole().name().equals("FARMER") && !product.getFarmerId().equals(user.getId())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "You can only update inventory for your own products");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            InventoryResponse updated = inventoryService.updateInventory(productId, request, user.getId());
            return ResponseEntity.ok(updated);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    /**
     * Check stock availability for a product
     */
    @GetMapping("/{productId}/check")
    public ResponseEntity<?> checkAvailability(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {
        try {
            boolean available = inventoryService.checkAvailability(productId, quantity);
            Map<String, Object> response = new HashMap<>();
            response.put("productId", productId);
            response.put("requestedQuantity", quantity);
            response.put("available", available);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    /**
     * Sync inventory with product quantity (Admin only)
     */
    @PostMapping("/sync/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> syncInventory(@PathVariable Long productId) {
        try {
            inventoryService.syncInventoryWithProduct(productId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Inventory synced successfully for product ID: " + productId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}
