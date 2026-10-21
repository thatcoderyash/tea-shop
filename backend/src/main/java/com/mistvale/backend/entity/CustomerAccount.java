package com.mistvale.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "customer_accounts")
public class CustomerAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role = "CUSTOMER";

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public CustomerAccount() {
    }

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }
}