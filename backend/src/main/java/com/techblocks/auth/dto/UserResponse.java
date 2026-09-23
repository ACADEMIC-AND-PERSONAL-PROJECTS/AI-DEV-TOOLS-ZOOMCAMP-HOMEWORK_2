package com.techblocks.auth.dto;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String fullName,
        String avatarUrl,
        Instant createdAt
) {
}
