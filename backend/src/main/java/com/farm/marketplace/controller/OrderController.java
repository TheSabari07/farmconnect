package com.farm.marketplace.controller;

import com.farm.marketplace.dto.OrderRequest;
import com.farm.marketplace.dto.OrderResponse;
import com.farm.marketplace.dto.OrderStatusUpdateRequest;
import com.farm.marketplace.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest request) {
        OrderResponse response = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        List<OrderResponse> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByBuyerId(@PathVariable Long buyerId) {
        List<OrderResponse> orders = orderService.getOrdersByBuyerId(buyerId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByFarmerId(@PathVariable Long farmerId) {
        List<OrderResponse> orders = orderService.getOrdersByFarmerId(farmerId);
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequest request) {
        OrderResponse response = orderService.updateOrderStatus(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelOrder(@PathVariable Long id) {
        orderService.cancelOrder(id);
        return ResponseEntity.noContent().build();
    }
}
