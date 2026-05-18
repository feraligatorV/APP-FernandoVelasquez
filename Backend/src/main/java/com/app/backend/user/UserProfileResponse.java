package com.app.backend.user;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class UserProfileResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String shippingAddress;
    private String email;
    private LocalDate birthDate;
}
