package com.farm.marketplace.repository;

import com.farm.marketplace.model.Delivery;
import com.farm.marketplace.model.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    
    /**
     * Find delivery by order ID
     */
    Optional<Delivery> findByOrderId(Long orderId);
    
    /**
     * Check if delivery exists for an order
     */
    boolean existsByOrderId(Long orderId);
    
    /**
     * Find all deliveries for a buyer
     */
    List<Delivery> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);
    
    /**
     * Find all deliveries for a farmer
     */
    List<Delivery> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);
    
    /**
     * Find deliveries by status
     */
    List<Delivery> findByDeliveryStatus(DeliveryStatus status);
    
    /**
     * Find deliveries by buyer and status
     */
    List<Delivery> findByBuyerIdAndDeliveryStatus(Long buyerId, DeliveryStatus status);
}
