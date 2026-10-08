package com.mistvale.backend.config;

import com.mistvale.backend.entity.Product;
import com.mistvale.backend.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeProducts(ProductRepository productRepository) {
        return args -> {

            if (productRepository.count() > 0) {
                return;
            }

            productRepository.save(new Product(
                    "Assam Breakfast Black Tea",
                    "Black",
                    349,
                    40,
                    "/images/p101.png",
                    "Strong, malty CTC tea from Upper Assam estates. Perfect with milk and a little sugar in the morning.",
                    4.6,
                    186
            ));

            productRepository.save(new Product(
                    "Darjeeling First Flush",
                    "Black",
                    1299,
                    12,
                    "/images/p102.png",
                    "Delicate, floral spring harvest leaves with a muscatel note. Best without milk.",
                    4.8,
                    128
            ));

            productRepository.save(new Product(
                    "Kashmiri Kahwa",
                    "Green",
                    549,
                    25,
                    "/images/p103.png",
                    "Green tea with saffron, cardamom, cinnamon and almond flakes.",
                    4.7,
                    94
            ));

            productRepository.save(new Product(
                    "Masala Chai Blend",
                    "Black",
                    399,
                    60,
                    "/images/p104.png",
                    "Bold Assam leaves with ginger, cardamom, clove and black pepper. Our bestseller.",
                    4.7,
                    342
            ));

            productRepository.save(new Product(
                    "Nilgiri Green Tea",
                    "Green",
                    449,
                    30,
                    "/images/p105.png",
                    "Smooth, grassy green tea from the Blue Mountains of the south.",
                    4.5,
                    117
            ));

            productRepository.save(new Product(
                    "Chamomile & Tulsi",
                    "Herbal",
                    499,
                    18,
                    "/images/p106.png",
                    "Caffeine-free calming blend of chamomile flowers and holy basil.",
                    4.8,
                    83
            ));

            productRepository.save(new Product(
                    "Hibiscus Rose Infusion",
                    "Herbal",
                    599,
                    0,
                    "/images/p107.png",
                    "Tangy hibiscus with rose petals. Lovely iced.",
                    4.6,
                    76
            ));

            productRepository.save(new Product(
                    "Tea Lover's Sampler Gift Box",
                    "Gifts",
                    1899,
                    9,
                    "/images/p108.png",
                    "Six of our favourite teas in a wooden gift box with a brewing guide.",
                    4.9,
                    156
            ));
        };
    }
}