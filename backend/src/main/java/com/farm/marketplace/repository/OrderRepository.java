package com.farm.marketplace.repository;

import com.farm.marketplace.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    List<Order> findByBuyerId(Long buyerId);
    
    @Query("SELECT o FROM Order o WHERE o.productId IN " +
           "(SELECT p.id FROM Product p WHERE p.farmerId = :farmerId)")
    List<Order> findOrdersByFarmerId(@Param("farmerId") Long farmerId);
}
