package com.app.backend.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CartFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldCompleteCartCheckoutFlow() throws Exception {
        String email = "cart.flow@example.com";

        String registerBody = """
                {
                  "firstName":"Cart",
                  "lastName":"Flow",
                  "shippingAddress":"Guatemala City",
                  "email":"%s",
                  "birthDate":"1994-01-10",
                  "password":"StrongPass123"
                }
                """.formatted(email);

        String registerResponse = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String token = objectMapper.readTree(registerResponse).get("token").asText();
        assertThat(token).isNotBlank();

        String productsResponse = mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode products = objectMapper.readTree(productsResponse);
        assertThat(products.isArray()).isTrue();
        assertThat(products.size()).isGreaterThan(0);
        long productId = products.get(0).get("id").asLong();

        String addItemBody = """
                {
                  "productId": %d,
                  "quantity": 2
                }
                """.formatted(productId);

        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(addItemBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].productId").value(productId));

        mockMvc.perform(get("/api/cart")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1));

        String checkoutResponse = mockMvc.perform(post("/api/cart/checkout")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").isNumber())
                .andReturn()
                .getResponse()
                .getContentAsString();

        long orderId = objectMapper.readTree(checkoutResponse).get("orderId").asLong();
        assertThat(orderId).isPositive();

        mockMvc.perform(get("/api/orders")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(orderId));
    }
}
