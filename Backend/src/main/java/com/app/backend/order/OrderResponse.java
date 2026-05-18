package com.app.backend.order;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@Builder
public class OrderResponse {
    private Long id;
    private Instant createdAt;
    private BigDecimal totalAmount;
    private List<OrderItemResponse> items;
}
