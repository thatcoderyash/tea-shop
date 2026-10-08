package com.mistvale.backend.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private double price;

    @Column(nullable = false)
    private int stock;

    @Column(nullable = false)
    private String image;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double rating;

    private Integer reviews;

    public Product() {
    }

    public Product(
            String name,
            String category,
            double price,
            int stock,
            String image,
            String description,
            Double rating,
            Integer reviews
    ) {
        this.name = name;
        this.category = category;
        this.price = price;
        this.stock = stock;
        this.image = image;
        this.description = description;
        this.rating = rating;
        this.reviews = reviews;
    }

}
