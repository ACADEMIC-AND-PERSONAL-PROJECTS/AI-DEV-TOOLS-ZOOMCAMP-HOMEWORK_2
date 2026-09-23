package com.techblocks.block.dto;

import com.fasterxml.jackson.databind.JsonNode;

import java.time.Instant;
import java.util.UUID;

public record BlockResponse(UUID id, String type, JsonNode content, int position, Instant createdAt, Instant updatedAt) {
}
