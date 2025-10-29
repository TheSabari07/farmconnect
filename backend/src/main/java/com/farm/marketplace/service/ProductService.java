package com.farm.marketplace.service;

import com.farm.marketplace.dto.ProductRequest;
import com.farm.marketplace.dto.ProductResponse;
import com.farm.marketplace.exception.ResourceNotFoundException;
import com.farm.marketplace.exception.UnauthorizedException;
import com.farm.marketplace.model.Product;
import com.farm.marketplace.model.Role;
import com.farm.marketplace.model.User;
import com.farm.marketplace.repository.ProductRepository;
import com.farm.marketplace.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private InventoryService inventoryService;

    public ProductResponse createProduct(ProductRequest request) {
        User farmer = getCurrentUser();
        
        // Check if user is a farmer
        if (farmer.getRole() != Role.FARMER) {
            throw new UnauthorizedException("Only farmers can create products");
        }

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setQuantity(request.getQuantity());
        product.setLocation(request.getLocation());
        product.setFarmerId(farmer.getId());

        Product savedProduct = productRepository.save(product);
        
        // Initialize inventory for the new product
        inventoryService.initializeInventory(savedProduct.getId(), savedProduct.getQuantity());
        
        return mapToResponse(savedProduct, farmer);
    }

    public List<ProductResponse> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return products.stream()
                .map(this::mapToResponseWithFarmer)
                .collect(Collectors.toList());
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToResponseWithFarmer(product);
    }

    public ProductResponse updateProduct(Long id, ProductRequest request) {
        User user = getCurrentUser();
        
        // Check if user is a farmer or admin
        if (user.getRole() != Role.FARMER && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only farmers and admins can update products");
        }

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        // Farmers can only update their own products, admins can update any
        if (user.getRole() == Role.FARMER && !product.getFarmerId().equals(user.getId())) {
            throw new UnauthorizedException("You can only update your own products");
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setQuantity(request.getQuantity());
        product.setLocation(request.getLocation());

        Product updatedProduct = productRepository.save(product);
        
        // Sync inventory with updated product quantity
        inventoryService.syncInventoryWithProduct(updatedProduct.getId());
        
        return mapToResponse(updatedProduct, user);
    }

    public void deleteProduct(Long id) {
        User user = getCurrentUser();
        
        // Check if user is a farmer or admin
        if (user.getRole() != Role.FARMER && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only farmers and admins can delete products");
        }

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        // Farmers can only delete their own products, admins can delete any
        if (user.getRole() == Role.FARMER && !product.getFarmerId().equals(user.getId())) {
            throw new UnauthorizedException("You can only delete your own products");
        }

        productRepository.delete(product);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private ProductResponse mapToResponse(Product product, User farmer) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setQuantity(product.getQuantity());
        response.setLocation(product.getLocation());
        response.setFarmerId(product.getFarmerId());
        response.setFarmerName(farmer.getName());
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());
        return response;
    }

    private ProductResponse mapToResponseWithFarmer(Product product) {
        User farmer = userRepository.findById(product.getFarmerId())
                .orElse(null);
        String farmerName = farmer != null ? farmer.getName() : "Unknown";
        
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setQuantity(product.getQuantity());
        response.setLocation(product.getLocation());
        response.setFarmerId(product.getFarmerId());
        response.setFarmerName(farmerName);
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());
        return response;
    }
}
