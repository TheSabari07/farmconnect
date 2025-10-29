package com.farm.marketplace.service;

import com.farm.marketplace.dto.InventoryResponse;
import com.farm.marketplace.dto.InventoryUpdateRequest;
import com.farm.marketplace.model.Inventory;
import com.farm.marketplace.model.Product;
import com.farm.marketplace.repository.InventoryRepository;
import com.farm.marketplace.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryService {
    
    private static final Logger logger = LoggerFactory.getLogger(InventoryService.class);
    
    @Autowired
    private InventoryRepository inventoryRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    /**
     * Get all inventory items
     */
    @Transactional(readOnly = true)
    public List<InventoryResponse> getAllInventory() {
        return inventoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get inventory items for a specific farmer
     */
    @Transactional(readOnly = true)
    public List<InventoryResponse> getInventoryByFarmerId(Long farmerId) {
        // Get all products for this farmer
        List<Product> farmerProducts = productRepository.findByFarmerId(farmerId);
        
        // Get inventory for each product
        return farmerProducts.stream()
                .map(product -> {
                    try {
                        return inventoryRepository.findByProductId(product.getId())
                                .map(this::mapToResponse)
                                .orElse(null);
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(inventory -> inventory != null)
                .collect(Collectors.toList());
    }
    
    /**
     * Get inventory for a specific product
     */
    @Transactional(readOnly = true)
    public InventoryResponse getInventoryByProductId(Long productId) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Inventory not found for product ID: " + productId));
        return mapToResponse(inventory);
    }
    
    /**
     * Initialize inventory for a new product
     */
    @Transactional
    public Inventory initializeInventory(Long productId, Integer initialQuantity) {
        // Check if inventory already exists
        if (inventoryRepository.existsByProductId(productId)) {
            logger.warn("Inventory already exists for product ID: {}", productId);
            return inventoryRepository.findByProductId(productId).orElseThrow();
        }
        
        Inventory inventory = new Inventory();
        inventory.setProductId(productId);
        inventory.setAvailableQuantity(initialQuantity);
        inventory.setReservedQuantity(0);
        
        Inventory saved = inventoryRepository.save(inventory);
        logger.info("Initialized inventory for product ID: {} with quantity: {}", productId, initialQuantity);
        return saved;
    }
    
    /**
     * Check if sufficient stock is available
     */
    @Transactional(readOnly = true)
    public boolean checkAvailability(Long productId, Integer requestedQuantity) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Inventory not found for product ID: " + productId));
        return inventory.getAvailableQuantity() >= requestedQuantity;
    }
    
    /**
     * Decrease inventory when order is placed
     */
    @Transactional
    public void decreaseInventory(Long productId, Integer quantity) {
        Inventory inventory = inventoryRepository.findByProductIdWithLock(productId)
                .orElseThrow(() -> new RuntimeException("Inventory not found for product ID: " + productId));
        
        int oldQuantity = inventory.getAvailableQuantity();
        
        if (oldQuantity < quantity) {
            throw new RuntimeException("Insufficient stock. Available: " + oldQuantity + ", Requested: " + quantity);
        }
        
        inventory.setAvailableQuantity(oldQuantity - quantity);
        inventoryRepository.save(inventory);
        
        logger.info("Decreased inventory for product ID: {} | Old: {} → New: {} | Change: -{}", 
                    productId, oldQuantity, inventory.getAvailableQuantity(), quantity);
    }
    
    /**
     * Increase inventory when order is cancelled
     */
    @Transactional
    public void increaseInventory(Long productId, Integer quantity) {
        Inventory inventory = inventoryRepository.findByProductIdWithLock(productId)
                .orElseThrow(() -> new RuntimeException("Inventory not found for product ID: " + productId));
        
        int oldQuantity = inventory.getAvailableQuantity();
        inventory.setAvailableQuantity(oldQuantity + quantity);
        inventoryRepository.save(inventory);
        
        logger.info("Increased inventory for product ID: {} | Old: {} → New: {} | Change: +{}", 
                    productId, oldQuantity, inventory.getAvailableQuantity(), quantity);
    }
    
    /**
     * Manually update inventory (farmer/admin only)
     */
    @Transactional
    public InventoryResponse updateInventory(Long productId, InventoryUpdateRequest request, Long userId) {
        // Verify product exists and user has permission
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        Inventory inventory = inventoryRepository.findByProductIdWithLock(productId)
                .orElseThrow(() -> new RuntimeException("Inventory not found for product ID: " + productId));
        
        int oldQuantity = inventory.getAvailableQuantity();
        inventory.setAvailableQuantity(request.getQuantity());
        Inventory updated = inventoryRepository.save(inventory);
        
        logger.info("Manual inventory update for product ID: {} by user ID: {} | Old: {} → New: {} | Reason: {}", 
                    productId, userId, oldQuantity, request.getQuantity(), 
                    request.getReason() != null ? request.getReason() : "Not specified");
        
        return mapToResponse(updated);
    }
    
    /**
     * Sync inventory with product quantity (for existing products)
     */
    @Transactional
    public void syncInventoryWithProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElse(null);
        
        if (inventory == null) {
            // Create new inventory
            initializeInventory(productId, product.getQuantity());
        } else {
            // Update existing inventory
            int oldQuantity = inventory.getAvailableQuantity();
            inventory.setAvailableQuantity(product.getQuantity());
            inventoryRepository.save(inventory);
            logger.info("Synced inventory for product ID: {} | Old: {} → New: {}", 
                        productId, oldQuantity, product.getQuantity());
        }
    }
    
    /**
     * Map Inventory entity to InventoryResponse DTO
     */
    private InventoryResponse mapToResponse(Inventory inventory) {
        Product product = productRepository.findById(inventory.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        InventoryResponse response = new InventoryResponse();
        response.setId(inventory.getId());
        response.setProductId(inventory.getProductId());
        response.setProductName(product.getName());
        response.setAvailableQuantity(inventory.getAvailableQuantity());
        response.setReservedQuantity(inventory.getReservedQuantity());
        response.setTotalQuantity(inventory.getAvailableQuantity() + inventory.getReservedQuantity());
        response.setLastUpdated(inventory.getLastUpdated());
        response.setCreatedAt(inventory.getCreatedAt());
        return response;
    }
}
