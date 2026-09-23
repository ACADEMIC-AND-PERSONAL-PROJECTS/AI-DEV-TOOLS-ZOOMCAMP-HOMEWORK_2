package com.techblocks.auth;

import com.techblocks.auth.dto.AuthResponse;
import com.techblocks.auth.dto.LoginRequest;
import com.techblocks.auth.dto.RegisterRequest;
import com.techblocks.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, jwtService);
    }

    @Test
    void shouldRegisterUserWhenEmailAvailable() {
        RegisterRequest request = new RegisterRequest("alice@example.com", "password123", "Alice Dupont");
        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(passwordEncoder.encode(request.password())).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });

        var response = authService.register(request);

        assertThat(response.email()).isEqualTo("alice@example.com");
        assertThat(response.fullName()).isEqualTo("Alice Dupont");
        verify(passwordEncoder).encode("password123");
    }

    @Test
    void shouldReturnConflictWhenEmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest("alice@example.com", "password123", "Alice Dupont");
        when(userRepository.existsByEmail(request.email())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(exception -> assertThat(((ResponseStatusException) exception).getStatusCode())
                        .isEqualTo(HttpStatus.CONFLICT));
    }

    @Test
    void shouldReturnTokenWhenCredentialsValid() {
        LoginRequest request = new LoginRequest("alice@example.com", "password123");
        User user = User.builder()
                .id(UUID.randomUUID())
                .email("alice@example.com")
                .passwordHash("hashed")
                .fullName("Alice Dupont")
                .build();
        when(userRepository.findByEmail(request.email())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.password(), "hashed")).thenReturn(true);
        when(jwtService.issueToken(user)).thenReturn("jwt-token");

        AuthResponse response = authService.login(request);

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.user().email()).isEqualTo("alice@example.com");
    }

    @Test
    void shouldReturnUnauthorizedWhenPasswordIncorrect() {
        LoginRequest request = new LoginRequest("alice@example.com", "wrong");
        User user = User.builder().email("alice@example.com").passwordHash("hashed").build();
        when(userRepository.findByEmail(request.email())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.password(), "hashed")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(exception -> assertThat(((ResponseStatusException) exception).getStatusCode())
                        .isEqualTo(HttpStatus.UNAUTHORIZED));
    }

    @Test
    void shouldReturnUnauthorizedWhenEmailUnknown() {
        LoginRequest request = new LoginRequest("unknown@example.com", "password123");
        when(userRepository.findByEmail(request.email())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(exception -> assertThat(((ResponseStatusException) exception).getStatusCode())
                        .isEqualTo(HttpStatus.UNAUTHORIZED));
    }
}
