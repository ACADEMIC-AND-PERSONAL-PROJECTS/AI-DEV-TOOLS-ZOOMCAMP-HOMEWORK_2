package com.techblocks.block.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.UUID;

public record BlockUpsertRequest(
        UUID id,
        @NotBlank @Pattern(regexp = "MARKDOWN|CODE|MERMAID|API_ENDPOINT|CALLOUT") String type,
        @NotNull JsonNode content) {
}
