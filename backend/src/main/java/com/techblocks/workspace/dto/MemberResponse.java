package com.techblocks.workspace.dto;

import java.time.Instant;
import java.util.UUID;

public record MemberResponse(UUID id, UUID userId, String email, String fullName, String avatarUrl, String role, Instant joinedAt) {
}
