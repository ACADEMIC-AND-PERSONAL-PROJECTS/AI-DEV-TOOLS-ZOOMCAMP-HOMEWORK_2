package com.techblocks.revision.dto;

import com.fasterxml.jackson.databind.JsonNode;

import java.time.Instant;
import java.util.UUID;

public record RevisionResponse(
        UUID id,
        UUID documentId,
        String title,
        JsonNode snapshot,
        UUID createdBy,
        Instant createdAt) {
}
