
package com.mistvale.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
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

    @NotBlank(message = "Product name is required.")
    @Size(max = 150, message = "Product name cannot exceed 150 characters.")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Category is required.")
    @Size(max = 50, message = "Category cannot exceed 50 characters.")
    @Column(nullable = false)
    private String category;

    @Positive(message = "Price must be greater than zero.")
    @Column(nullable = false)
    private double price;

    @Min(value = 0, message = "Stock cannot be negative.")
    @Column(nullable = false)
    private int stock;

    @NotBlank(message = "Image path is required.")
    @Size(max = 500, message = "Image path cannot exceed 500 characters.")
    @Column(nullable = false)
    private String image;

    @Size(max = 5000, message = "Description cannot exceed 5000 characters.")
    @Column(columnDefinition = "TEXT")
    private String description;

    @DecimalMin(value = "0.0", message = "Rating cannot be below 0.")
    @DecimalMax(value = "5.0", message = "Rating cannot exceed 5.")
    private Double rating;

    @Min(value = 0, message = "Review count cannot be negative.")
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
