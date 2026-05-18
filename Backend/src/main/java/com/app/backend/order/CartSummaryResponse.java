package com.app.backend.order;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class CartSummaryResponse {
    private List<CartItemResponse> items;
    private BigDecimal totalAmount;
}
