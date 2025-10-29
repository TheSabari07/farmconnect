package com.farm.marketplace.service;

import com.farm.marketplace.dto.OrderRequest;
import com.farm.marketplace.dto.OrderResponse;
import com.farm.marketplace.dto.OrderStatusUpdateRequest;
import com.farm.marketplace.exception.ResourceNotFoundException;
import com.farm.marketplace.exception.UnauthorizedException;
import com.farm.marketplace.model.*;
import com.farm.marketplace.repository.OrderRepository;
import com.farm.marketplace.repository.ProductRepository;
import com.farm.marketplace.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private InventoryService inventoryService;
    
    @Autowired
    private DeliveryService deliveryService;

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        User buyer = getCurrentUser();
        
        // Only buyers can place orders
        if (buyer.getRole() != Role.BUYER) {
            throw new UnauthorizedException("Only buyers can place orders");
        }

        // Get product and validate
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        // Check inventory availability
        if (!inventoryService.checkAvailability(product.getId(), request.getQuantity())) {
            throw new RuntimeException("Insufficient stock. Please check product availability.");
        }

        // Calculate total price
        Double totalPrice = product.getPrice() * request.getQuantity();

        // Create order
        Order order = new Order();
        order.setProductId(product.getId());
        order.setBuyerId(buyer.getId());
        order.setQuantity(request.getQuantity());
        order.setTotalPrice(totalPrice);
        order.setStatus(OrderStatus.PENDING);

        Order savedOrder = orderRepository.save(order);

        // Decrease inventory (automatic inventory management)
        inventoryService.decreaseInventory(product.getId(), request.getQuantity());
        
        // Also update product quantity for backward compatibility
        product.setQuantity(product.getQuantity() - request.getQuantity());
        productRepository.save(product);

        return mapToResponse(savedOrder);
    }

    public List<OrderResponse> getAllOrders() {
        User user = getCurrentUser();
        
        // Only admins can view all orders
        if (user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can view all orders");
        }

        return orderRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getOrdersByBuyerId(Long buyerId) {
        User currentUser = getCurrentUser();
        
        // Buyers can only see their own orders, admins can see any
        if (currentUser.getRole() == Role.BUYER && !currentUser.getId().equals(buyerId)) {
            throw new UnauthorizedException("You can only view your own orders");
        }

        return orderRepository.findByBuyerId(buyerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getOrdersByFarmerId(Long farmerId) {
        User currentUser = getCurrentUser();
        
        // Farmers can only see orders for their products, admins can see any
        if (currentUser.getRole() == Role.FARMER && !currentUser.getId().equals(farmerId)) {
            throw new UnauthorizedException("You can only view orders for your own products");
        }

        return orderRepository.findOrdersByFarmerId(farmerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatusUpdateRequest request) {
        User currentUser = getCurrentUser();
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Get product to check farmer ownership
        Product product = productRepository.findById(order.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // Only farmer (who owns the product) or admin can update status
        if (currentUser.getRole() == Role.FARMER && !currentUser.getId().equals(product.getFarmerId())) {
            throw new UnauthorizedException("You can only update status for orders of your own products");
        } else if (currentUser.getRole() == Role.BUYER) {
            throw new UnauthorizedException("Buyers cannot update order status");
        }

        // Validate status transition
        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Cannot update status of delivered or cancelled orders");
        }

        OrderStatus oldStatus = order.getStatus();
        order.setStatus(request.getStatus());
        Order updatedOrder = orderRepository.save(order);
        
        // Auto-create delivery when order status changes to SHIPPED
        if (request.getStatus() == OrderStatus.SHIPPED && oldStatus != OrderStatus.SHIPPED) {
            try {
                deliveryService.autoCreateDeliveryForShippedOrder(orderId);
            } catch (Exception e) {
                // Log error but don't fail the order update
                System.err.println("Failed to create delivery for order " + orderId + ": " + e.getMessage());
            }
        }

        return mapToResponse(updatedOrder);
    }

    @Transactional
    public void cancelOrder(Long orderId) {
        User user = getCurrentUser();
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Buyers can only cancel their own orders, admins can cancel any
        if (user.getRole() != Role.ADMIN && !order.getBuyerId().equals(user.getId())) {
            throw new UnauthorizedException("You can only cancel your own orders");
        }

        // Cannot cancel if already shipped, delivered, or cancelled
        if (order.getStatus() == OrderStatus.SHIPPED || 
            order.getStatus() == OrderStatus.DELIVERED || 
            order.getStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Cannot cancel order with status: " + order.getStatus());
        }

        // Restore inventory (automatic inventory management)
        inventoryService.increaseInventory(order.getProductId(), order.getQuantity());
        
        // Also restore product quantity for backward compatibility
        Product product = productRepository.findById(order.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.setQuantity(product.getQuantity() + order.getQuantity());
        productRepository.save(product);

        // Update order status to cancelled
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private OrderResponse mapToResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setProductId(order.getProductId());
        response.setBuyerId(order.getBuyerId());
        response.setQuantity(order.getQuantity());
        response.setTotalPrice(order.getTotalPrice());
        response.setStatus(order.getStatus());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());

        // Get product details
        productRepository.findById(order.getProductId()).ifPresent(product -> {
            response.setProductName(product.getName());
            response.setFarmerId(product.getFarmerId());
            
            // Get farmer name
            userRepository.findById(product.getFarmerId()).ifPresent(farmer -> {
                response.setFarmerName(farmer.getName());
            });
        });

        // Get buyer name
        userRepository.findById(order.getBuyerId()).ifPresent(buyer -> {
            response.setBuyerName(buyer.getName());
        });

        return response;
    }
}
