package com.app.backend.auth;

import com.app.backend.auth.dto.AuthResponse;
import com.app.backend.auth.dto.ForgotPasswordRequest;
import com.app.backend.auth.dto.ForgotPasswordResponse;
import com.app.backend.auth.dto.LoginRequest;
import com.app.backend.auth.dto.RegisterRequest;
import com.app.backend.auth.dto.ResetPasswordRequest;
import com.app.backend.common.ApiException;
import com.app.backend.security.JwtService;
import com.app.backend.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.app.backend.user.UserRepository;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .shippingAddress(request.getShippingAddress())
                .email(normalizedEmail)
                .birthDate(request.getBirthDate())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        User saved = userRepository.save(user);
        log.info("User registered successfully. userId={}, email={}", saved.getId(), saved.getEmail());
        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponse(token);
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
        );

        log.info("User authenticated successfully. email={}", normalizedEmail);
        String token = jwtService.generateToken(normalizedEmail);
        return new AuthResponse(token);
    }

    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        return userRepository.findByEmail(normalizedEmail)
                .map(user -> {
                    String resetToken = UUID.randomUUID().toString().replace("-", "");
                    user.setResetPasswordToken(resetToken);
                    user.setResetPasswordTokenExpiresAt(LocalDateTime.now().plusMinutes(15));
                    userRepository.save(user);
                    log.info("Password reset requested. email={}", normalizedEmail);
                    return new ForgotPasswordResponse(
                            "Recovery token generated. Use it to reset your password.",
                            resetToken
                    );
                })
                .orElseGet(() -> new ForgotPasswordResponse(
                        "If the email exists, a recovery token has been generated.",
                        null
                ));
    }

    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetPasswordToken(request.getToken())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid reset token"));

        if (user.getResetPasswordTokenExpiresAt() == null || user.getResetPasswordTokenExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Reset token expired");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiresAt(null);
        userRepository.save(user);
        log.info("Password reset completed. userId={}, email={}", user.getId(), user.getEmail());
    }
}
