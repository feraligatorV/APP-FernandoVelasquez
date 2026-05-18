package com.app.backend.order;

import com.app.backend.common.ApiException;
import com.app.backend.product.Product;
import com.app.backend.product.ProductRepository;
import com.app.backend.user.User;
import com.app.backend.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private CartItemRepository cartItemRepository;
    @Mock
    private PurchaseOrderRepository purchaseOrderRepository;

    @InjectMocks
    private CartService cartService;

    @Test
    void addItemShouldFailWhenQuantityExceedsMax() {
        User user = User.builder().id(1L).email("u@mail.com").build();
        Product product = Product.builder().id(3L).price(BigDecimal.TEN).build();
        CartItem existing = CartItem.builder().id(10L).user(user).product(product).quantity(90).build();

        AddCartItemRequest request = new AddCartItemRequest();
        request.setProductId(3L);
        request.setQuantity(10);

        when(userRepository.findByEmail("u@mail.com")).thenReturn(Optional.of(user));
        when(productRepository.findById(3L)).thenReturn(Optional.of(product));
        when(cartItemRepository.findByUserAndProductId(user, 3L)).thenReturn(Optional.of(existing));

        assertThrows(ApiException.class, () -> cartService.addItem("u@mail.com", request));
    }

    @Test
    void getCartShouldReturnTotalAmount() {
        User user = User.builder().id(1L).email("u@mail.com").build();
        Product p1 = Product.builder().id(1L).name("A").imageUrl("x").price(new BigDecimal("10.00")).build();
        Product p2 = Product.builder().id(2L).name("B").imageUrl("y").price(new BigDecimal("5.50")).build();
        CartItem i1 = CartItem.builder().id(1L).user(user).product(p1).quantity(2).build();
        CartItem i2 = CartItem.builder().id(2L).user(user).product(p2).quantity(1).build();

        when(userRepository.findByEmail("u@mail.com")).thenReturn(Optional.of(user));
        when(cartItemRepository.findByUser(user)).thenReturn(List.of(i1, i2));

        CartSummaryResponse response = cartService.getCart("u@mail.com");
        assertEquals(new BigDecimal("25.50"), response.getTotalAmount());
        assertEquals(2, response.getItems().size());
    }
}
