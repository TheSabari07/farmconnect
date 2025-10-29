package com.farm.marketplace.service;

import com.farm.marketplace.dto.DeliveryCreateRequest;
import com.farm.marketplace.dto.DeliveryResponse;
import com.farm.marketplace.dto.DeliveryStatusUpdateRequest;
import com.farm.marketplace.exception.ResourceNotFoundException;
import com.farm.marketplace.model.*;
import com.farm.marketplace.repository.DeliveryRepository;
import com.farm.marketplace.repository.OrderRepository;
import com.farm.marketplace.repository.ProductRepository;
import com.farm.marketplace.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DeliveryService {
    
    private static final Logger logger = LoggerFactory.getLogger(DeliveryService.class);
    
    @Autowired
    private DeliveryRepository deliveryRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Create delivery entry for an order (called when order is shipped)
     */
    @Transactional
    public DeliveryResponse createDelivery(Long orderId, DeliveryCreateRequest request) {
        // Check if delivery already exists
        if (deliveryRepository.existsByOrderId(orderId)) {
            throw new RuntimeException("Delivery already exists for order ID: " + orderId);
        }
        
        // Get order details
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        // Verify order is shipped
        if (order.getStatus() != OrderStatus.SHIPPED) {
            throw new RuntimeException("Cannot create delivery for order that is not shipped. Current status: " + order.getStatus());
        }
        
        // Get product to find farmer
        Product product = productRepository.findById(order.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        // Create delivery
        Delivery delivery = new Delivery();
        delivery.setOrderId(orderId);
        delivery.setFarmerId(product.getFarmerId());
        delivery.setBuyerId(order.getBuyerId());
        delivery.setDeliveryStatus(DeliveryStatus.PENDING);
        
        // Set estimated delivery date (default 3 days if not provided)
        if (request != null && request.getEstimatedDeliveryDate() != null) {
            delivery.setEstimatedDeliveryDate(request.getEstimatedDeliveryDate());
        } else {
            delivery.setEstimatedDeliveryDate(LocalDate.now().plusDays(3));
        }
        
        if (request != null) {
            delivery.setTrackingLocation(request.getTrackingLocation());
            delivery.setDeliveryNotes(request.getDeliveryNotes());
        }
        
        Delivery savedDelivery = deliveryRepository.save(delivery);
        
        logger.info("Created delivery for order ID: {} | Estimated delivery: {}", 
                    orderId, savedDelivery.getEstimatedDeliveryDate());
        
        return mapToResponse(savedDelivery);
    }
    
    /**
     * Auto-create delivery when order status changes to SHIPPED
     */
    @Transactional
    public DeliveryResponse autoCreateDeliveryForShippedOrder(Long orderId) {
        // Check if delivery already exists
        if (deliveryRepository.existsByOrderId(orderId)) {
            logger.info("Delivery already exists for order ID: {}", orderId);
            return getDeliveryByOrderId(orderId);
        }
        
        DeliveryCreateRequest request = new DeliveryCreateRequest();
        request.setEstimatedDeliveryDate(LocalDate.now().plusDays(3));
        request.setTrackingLocation("Warehouse - Preparing for shipment");
        
        return createDelivery(orderId, request);
    }
    
    /**
     * Get delivery details by order ID
     */
    @Transactional(readOnly = true)
    public DeliveryResponse getDeliveryByOrderId(Long orderId) {
        Delivery delivery = deliveryRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found for order ID: " + orderId));
        return mapToResponse(delivery);
    }
    
    /**
     * Update delivery status
     */
    @Transactional
    public DeliveryResponse updateDeliveryStatus(Long orderId, DeliveryStatusUpdateRequest request) {
        Delivery delivery = deliveryRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found for order ID: " + orderId));
        
        DeliveryStatus oldStatus = delivery.getDeliveryStatus();
        delivery.setDeliveryStatus(request.getStatus());
        
        // Update tracking location if provided
        if (request.getTrackingLocation() != null && !request.getTrackingLocation().isEmpty()) {
            delivery.setTrackingLocation(request.getTrackingLocation());
        }
        
        // Update delivery notes if provided
        if (request.getDeliveryNotes() != null && !request.getDeliveryNotes().isEmpty()) {
            delivery.setDeliveryNotes(request.getDeliveryNotes());
        }
        
        // Set actual delivery date when status is DELIVERED
        if (request.getStatus() == DeliveryStatus.DELIVERED && delivery.getActualDeliveryDate() == null) {
            delivery.setActualDeliveryDate(LocalDate.now());
            
            // Also update order status to DELIVERED
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
            order.setStatus(OrderStatus.DELIVERED);
            orderRepository.save(order);
            
            logger.info("Order ID: {} marked as DELIVERED", orderId);
        }
        
        Delivery updatedDelivery = deliveryRepository.save(delivery);
        
        logger.info("Updated delivery status for order ID: {} | {} → {} | Location: {}", 
                    orderId, oldStatus, request.getStatus(), request.getTrackingLocation());
        
        return mapToResponse(updatedDelivery);
    }
    
    /**
     * Get all deliveries for a buyer
     */
    @Transactional(readOnly = true)
    public List<DeliveryResponse> getDeliveriesForBuyer(Long buyerId) {
        List<Delivery> deliveries = deliveryRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId);
        return deliveries.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all deliveries for a farmer
     */
    @Transactional(readOnly = true)
    public List<DeliveryResponse> getDeliveriesForFarmer(Long farmerId) {
        List<Delivery> deliveries = deliveryRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId);
        return deliveries.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all deliveries (admin only)
     */
    @Transactional(readOnly = true)
    public List<DeliveryResponse> getAllDeliveries() {
        List<Delivery> deliveries = deliveryRepository.findAll();
        return deliveries.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Map Delivery entity to DeliveryResponse DTO
     */
    private DeliveryResponse mapToResponse(Delivery delivery) {
        DeliveryResponse response = new DeliveryResponse();
        response.setId(delivery.getId());
        response.setOrderId(delivery.getOrderId());
        response.setFarmerId(delivery.getFarmerId());
        response.setBuyerId(delivery.getBuyerId());
        response.setDeliveryStatus(delivery.getDeliveryStatus());
        response.setEstimatedDeliveryDate(delivery.getEstimatedDeliveryDate());
        response.setActualDeliveryDate(delivery.getActualDeliveryDate());
        response.setTrackingLocation(delivery.getTrackingLocation());
        response.setDeliveryNotes(delivery.getDeliveryNotes());
        response.setCreatedAt(delivery.getCreatedAt());
        response.setUpdatedAt(delivery.getUpdatedAt());
        
        // Get farmer name
        userRepository.findById(delivery.getFarmerId()).ifPresent(farmer -> {
            response.setFarmerName(farmer.getName());
        });
        
        // Get buyer name
        userRepository.findById(delivery.getBuyerId()).ifPresent(buyer -> {
            response.setBuyerName(buyer.getName());
        });
        
        // Get product name from order
        orderRepository.findById(delivery.getOrderId()).ifPresent(order -> {
            productRepository.findById(order.getProductId()).ifPresent(product -> {
                response.setProductName(product.getName());
            });
        });
        
        return response;
    }
}
