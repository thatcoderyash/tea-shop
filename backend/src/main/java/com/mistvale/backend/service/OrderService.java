package com.mistvale.backend.service;

import com.mistvale.backend.dto.CreateOrderRequest;
import com.mistvale.backend.dto.OrderItemRequest;
import com.mistvale.backend.entity.Order;
import com.mistvale.backend.entity.OrderItem;
import com.mistvale.backend.entity.Product;
import com.mistvale.backend.repository.OrderRepository;
import com.mistvale.backend.repository.ProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

@Service
public class OrderService {

    private static final double SHIPPING_FEE = 49.0;
    private static final double FREE_SHIPPING_THRESHOLD = 599.0;
    private static final double COUPON_MIN_SUBTOTAL = 399.0;
    private static final double COUPON_MAX_DISCOUNT = 150.0;
    private static final double COUPON_RATE = 0.10;

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderService(
            OrderRepository orderRepository,
            ProductRepository productRepository
    ) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        Order order = new Order();

        order.setCustomerName(request.customerName().trim());
        order.setEmail(request.email().trim());
        order.setPhone(request.phone().trim());
        order.setAddress(request.address().trim());
        order.setCity(request.city().trim());
        order.setState(request.state().trim());
        order.setPincode(request.pincode().trim());

        double subtotal = 0;
        double eligibleSubtotal = 0;
        Set<Long> seenProductIds = new HashSet<>();

        for (OrderItemRequest requestedItem : request.items()) {
            if (!seenProductIds.add(requestedItem.productId())) {
                throw new IllegalArgumentException(
                        "Each product must appear only once in the order."
                );
            }

            Product product = productRepository.findByIdWithLock(
                    requestedItem.productId()
            ).orElseThrow(() -> new IllegalArgumentException(
                    "Product not found: " + requestedItem.productId()
            ));

            int quantity = requestedItem.quantity();

            if (quantity > 5) {
                throw new IllegalArgumentException(
                        "Maximum quantity per product is 5."
                );
            }

            if (product.getStock() < quantity) {
                throw new IllegalArgumentException(
                        product.getName() + " does not have enough stock."
                );
            }

            // Deduct purchased quantity from inventory.
            product.setStock(product.getStock() - quantity);
            productRepository.save(product);

            double lineTotal = product.getPrice() * quantity;
            subtotal += lineTotal;

            if (!"Gifts".equalsIgnoreCase(product.getCategory())) {
                eligibleSubtotal += lineTotal;
            }

            OrderItem item = new OrderItem();
            item.setProductId(product.getId());
            item.setProductName(product.getName());
            item.setPrice(product.getPrice());
            item.setQuantity(quantity);
            item.setOrder(order);

            order.getItems().add(item);
        }

        double discount = 0;
        String coupon = request.couponCode() == null
                ? ""
                : request.couponCode().trim();

        if (!coupon.isEmpty()) {
            if (!"WELCOME10".equalsIgnoreCase(coupon)) {
                throw new IllegalArgumentException("Invalid coupon code.");
            }

            if (subtotal < COUPON_MIN_SUBTOTAL) {
                throw new IllegalArgumentException(
                        "WELCOME10 requires a minimum subtotal of ₹399."
                );
            }

            if (eligibleSubtotal <= 0) {
                throw new IllegalArgumentException(
                        "WELCOME10 cannot be used on gift products."
                );
            }

            discount = Math.min(
                    Math.round(eligibleSubtotal * COUPON_RATE * 100.0) / 100.0,
                    COUPON_MAX_DISCOUNT
            );
        }

        double discountedSubtotal = subtotal - discount;
        double shipping = discountedSubtotal >= FREE_SHIPPING_THRESHOLD
                ? 0
                : SHIPPING_FEE;

        order.setSubtotal(subtotal);
        order.setDiscount(discount);
        order.setShipping(shipping);
        order.setTotal(discountedSubtotal + shipping);

        return orderRepository.save(order);
    }

    public Order getOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Order not found: " + id
                ));
    }
}