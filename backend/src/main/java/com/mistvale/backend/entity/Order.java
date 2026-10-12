package com.mistvale.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String pincode;

    @Column(nullable = false)
    private double subtotal;

    @Column(nullable = false)
    private double discount;

    @Column(nullable = false)
    private double shipping;

    @Column(nullable = false)
    private double total;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status = OrderStatus.PLACED;

    @Column(unique = true, length = 36)
    private String trackingToken;


    @OneToMany(
            mappedBy = "order",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private java.util.List<OrderItem> items = new java.util.ArrayList<>();

    public Order() {
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (trackingToken == null) {
            trackingToken = UUID.randomUUID().toString();
        }
    }

}