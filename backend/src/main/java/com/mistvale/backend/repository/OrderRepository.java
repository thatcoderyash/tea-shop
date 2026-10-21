package com.mistvale.backend.repository;

import com.mistvale.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByEmailIgnoreCaseOrderByCreatedAtDesc(String email);
}