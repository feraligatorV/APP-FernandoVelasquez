package com.app.backend.auth;

import com.app.backend.auth.dto.AuthResponse;
import com.app.backend.auth.dto.LoginRequest;
import com.app.backend.auth.dto.RegisterRequest;
import com.app.backend.common.ApiException;
import com.app.backend.security.JwtService;
import com.app.backend.user.User;
import com.app.backend.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerShouldHashPasswordAndNormalizeEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("Test");
        request.setLastName("User");
        request.setShippingAddress("Address");
        request.setEmail("TEST@MAIL.COM");
        request.setPassword("Pass1234");

        when(userRepository.existsByEmail("test@mail.com")).thenReturn(false);
        when(passwordEncoder.encode("Pass1234")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtService.generateToken("test@mail.com")).thenReturn("jwt-token");

        AuthResponse response = authService.register(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User saved = userCaptor.getValue();
        assertEquals("test@mail.com", saved.getEmail());
        assertEquals("hashed", saved.getPassword());
        assertEquals("jwt-token", response.getToken());
    }

    @Test
    void registerShouldFailWhenEmailExists() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("existing@mail.com");
        when(userRepository.existsByEmail("existing@mail.com")).thenReturn(true);
        assertThrows(ApiException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void loginShouldNormalizeEmailAndReturnToken() {
        LoginRequest request = new LoginRequest();
        request.setEmail("USER@MAIL.COM");
        request.setPassword("Pass1234");
        when(jwtService.generateToken("user@mail.com")).thenReturn("token");

        AuthResponse response = authService.login(request);

        verify(authenticationManager).authenticate(any());
        assertEquals("token", response.getToken());
    }
}
