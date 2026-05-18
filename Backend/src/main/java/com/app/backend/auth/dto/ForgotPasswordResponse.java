package com.app.backend.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ForgotPasswordResponse {
    private String message;
    private String resetToken;
}
