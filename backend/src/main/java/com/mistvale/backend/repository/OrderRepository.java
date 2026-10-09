package com.mistvale.backend.repository;

import com.mistvale.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
}