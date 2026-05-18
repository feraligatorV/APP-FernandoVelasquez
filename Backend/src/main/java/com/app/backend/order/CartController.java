package com.app.backend.order;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class CartController {

    private final CartService cartService;

    @Operation(summary = "Obtener resumen del carrito")
    @GetMapping("/api/cart")
    public ResponseEntity<CartSummaryResponse> getCart(Authentication authentication) {
        return ResponseEntity.ok(cartService.getCart(authentication.getName()));
    }

    @Operation(summary = "Agregar item al carrito")
    @PostMapping("/api/cart/items")
    public ResponseEntity<CartSummaryResponse> addCartItem(
            Authentication authentication,
            @Valid @RequestBody AddCartItemRequest request
    ) {
        return ResponseEntity.ok(cartService.addItem(authentication.getName(), request));
    }

    @Operation(summary = "Eliminar item del carrito")
    @DeleteMapping("/api/cart/items/{cartItemId}")
    public ResponseEntity<CartSummaryResponse> removeCartItem(
            Authentication authentication,
            @PathVariable Long cartItemId
    ) {
        return ResponseEntity.ok(cartService.removeItem(authentication.getName(), cartItemId));
    }

    @Operation(summary = "Completar pedido y devolver ID de orden")
    @PostMapping("/api/cart/checkout")
    public ResponseEntity<CheckoutResponse> checkout(Authentication authentication) {
        return ResponseEntity.ok(cartService.checkout(authentication.getName()));
    }

    @Operation(summary = "Listar pedidos del usuario (opcional)")
    @GetMapping("/api/orders")
    public ResponseEntity<List<OrderResponse>> listOrders(Authentication authentication) {
        return ResponseEntity.ok(cartService.listOrders(authentication.getName()));
    }
}
