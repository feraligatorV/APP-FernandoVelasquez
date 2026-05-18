package com.app.backend.order;

import com.app.backend.common.ApiException;
import com.app.backend.product.Product;
import com.app.backend.product.ProductRepository;
import com.app.backend.user.User;
import com.app.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CartItemRepository cartItemRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    @Transactional(readOnly = true)
    public CartSummaryResponse getCart(String email) {
        User user = getUserByEmail(email);
        List<CartItem> items = cartItemRepository.findByUser(user);
        return toCartSummary(items);
    }

    @Transactional
    public CartSummaryResponse addItem(String email, AddCartItemRequest request) {
        User user = getUserByEmail(email);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));

        CartItem item = cartItemRepository.findByUserAndProductId(user, product.getId())
                .map(existing -> {
                    int newQty = existing.getQuantity() + request.getQuantity();
                    if (newQty > 99) {
                        throw new ApiException(HttpStatus.BAD_REQUEST, "Maximum quantity per item is 99");
                    }
                    existing.setQuantity(newQty);
                    return existing;
                })
                .orElse(CartItem.builder()
                        .user(user)
                        .product(product)
                        .quantity(request.getQuantity())
                        .build());

        cartItemRepository.save(item);
        log.info("Cart updated. email={}, productId={}, quantity={}", email, product.getId(), item.getQuantity());
        return toCartSummary(cartItemRepository.findByUser(user));
    }

    @Transactional
    public CartSummaryResponse removeItem(String email, Long cartItemId) {
        User user = getUserByEmail(email);
        CartItem item = cartItemRepository.findByIdAndUser(cartItemId, user)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Cart item not found"));
        cartItemRepository.delete(item);
        log.info("Cart item removed. email={}, cartItemId={}", email, cartItemId);
        return toCartSummary(cartItemRepository.findByUser(user));
    }

    @Transactional
    public CheckoutResponse checkout(String email) {
        User user = getUserByEmail(email);
        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        if (cartItems.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        PurchaseOrder order = new PurchaseOrder();
        order.setUser(user);
        order.setCreatedAt(Instant.now());
        order.setItems(new ArrayList<>());

        BigDecimal total = BigDecimal.ZERO;
        for (CartItem cartItem : cartItems) {
            BigDecimal unitPrice = cartItem.getProduct().getPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            total = total.add(lineTotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(cartItem.getProduct())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(unitPrice)
                    .lineTotal(lineTotal)
                    .build();
            order.getItems().add(orderItem);
        }

        order.setTotalAmount(total);
        PurchaseOrder savedOrder = purchaseOrderRepository.save(order);
        cartItemRepository.deleteByUser(user);
        log.info("Checkout completed. email={}, orderId={}, total={}", email, savedOrder.getId(), total);
        return new CheckoutResponse(savedOrder.getId());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> listOrders(String email) {
        User user = getUserByEmail(email);
        List<PurchaseOrder> orders = purchaseOrderRepository.findByUserOrderByCreatedAtDesc(user);
        return orders.stream().map(this::toOrderResponse).toList();
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private CartSummaryResponse toCartSummary(List<CartItem> items) {
        List<CartItemResponse> responses = items.stream()
                .map(item -> {
                    BigDecimal unit = item.getProduct().getPrice();
                    BigDecimal line = unit.multiply(BigDecimal.valueOf(item.getQuantity()));
                    return CartItemResponse.builder()
                            .id(item.getId())
                            .productId(item.getProduct().getId())
                            .name(item.getProduct().getName())
                            .imageUrl(item.getProduct().getImageUrl())
                            .unitPrice(unit)
                            .quantity(item.getQuantity())
                            .lineTotal(line)
                            .build();
                })
                .toList();

        BigDecimal total = responses.stream()
                .map(CartItemResponse::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartSummaryResponse.builder()
                .items(responses)
                .totalAmount(total)
                .build();
    }

    private OrderResponse toOrderResponse(PurchaseOrder order) {
        return OrderResponse.builder()
                .id(order.getId())
                .createdAt(order.getCreatedAt())
                .totalAmount(order.getTotalAmount())
                .items(order.getItems().stream().map(item -> OrderItemResponse.builder()
                        .productId(item.getProduct().getId())
                        .name(item.getProduct().getName())
                        .imageUrl(item.getProduct().getImageUrl())
                        .unitPrice(item.getUnitPrice())
                        .quantity(item.getQuantity())
                        .lineTotal(item.getLineTotal())
                        .build()).toList())
                .build();
    }
}
