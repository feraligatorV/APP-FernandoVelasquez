package com.app.backend.product;

import com.app.backend.common.ApiException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    void updateProductShouldApplyChanges() {
        Product existing = Product.builder()
                .id(10L)
                .name("Old")
                .description("Old desc")
                .price(new BigDecimal("10.00"))
                .imageUrl("old")
                .build();
        ProductRequest request = new ProductRequest();
        request.setName("New");
        request.setDescription("New desc");
        request.setPrice(new BigDecimal("20.00"));
        request.setImageUrl("new");

        when(productRepository.findById(10L)).thenReturn(Optional.of(existing));
        when(productRepository.save(existing)).thenReturn(existing);

        Product updated = productService.updateProduct(10L, request);
        assertEquals("New", updated.getName());
        assertEquals(new BigDecimal("20.00"), updated.getPrice());
    }

    @Test
    void deleteProductShouldFailWhenMissing() {
        when(productRepository.existsById(999L)).thenReturn(false);
        assertThrows(ApiException.class, () -> productService.deleteProduct(999L));
    }
}
