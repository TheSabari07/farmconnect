package com.farm.marketplace.repository;

import com.farm.marketplace.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    
    /**
     * Find inventory by product ID with pessimistic lock to prevent race conditions
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventory i WHERE i.productId = :productId")
    Optional<Inventory> findByProductIdWithLock(Long productId);
    
    /**
     * Find inventory by product ID (read-only)
     */
    Optional<Inventory> findByProductId(Long productId);
    
    /**
     * Check if inventory exists for a product
     */
    boolean existsByProductId(Long productId);
}
