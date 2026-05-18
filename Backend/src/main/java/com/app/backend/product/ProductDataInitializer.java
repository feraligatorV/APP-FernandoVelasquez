package com.app.backend.product;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Component
@RequiredArgsConstructor
public class ProductDataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) {
            return;
        }

        String[] categories = {
                "Balon", "Camiseta", "Short", "Tenis", "Guantes", "Mancuernas", "Mat",
                "Botella", "Rodillera", "Cuerda", "Banda", "Casco", "Raqueta", "Calcetas"
        };
        String[] sports = {
                "Futbol", "Running", "Crossfit", "Basquet", "Tenis", "Ciclismo", "Yoga", "Gym"
        };
        String[] qualities = {
                "Pro", "Elite", "Active", "Performance", "Ultra", "Essential", "Core", "Max"
        };
        String[] images = {
                "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
                "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61",
                "https://images.unsplash.com/photo-1599447421416-3414500d18a5",
                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
                "https://images.unsplash.com/photo-1556817411-31ae72fa3ea0",
                "https://images.unsplash.com/photo-1549060279-7e168fcee0c2",
                "https://images.unsplash.com/photo-1605296867304-46d5465a13f1",
                "https://images.unsplash.com/photo-1461896836934-ffe607ba8211"
        };

        List<Product> products = new ArrayList<>();
        ThreadLocalRandom random = ThreadLocalRandom.current();

        for (int i = 0; i < 24; i++) {
            String category = categories[random.nextInt(categories.length)];
            String sport = sports[random.nextInt(sports.length)];
            String quality = qualities[random.nextInt(qualities.length)];
            String name = category + " " + sport + " " + quality;

            BigDecimal price = BigDecimal
                    .valueOf(random.nextDouble(9.99, 249.99))
                    .setScale(2, RoundingMode.HALF_UP);

            String description = "Producto " + quality.toLowerCase()
                    + " para " + sport.toLowerCase()
                    + ", ideal para entrenamiento y uso frecuente.";

            String imageUrl = images[random.nextInt(images.length)];

            products.add(Product.builder()
                    .name(name)
                    .description(description)
                    .price(price)
                    .imageUrl(imageUrl)
                    .build());
        }

        productRepository.saveAll(products);
    }
}
