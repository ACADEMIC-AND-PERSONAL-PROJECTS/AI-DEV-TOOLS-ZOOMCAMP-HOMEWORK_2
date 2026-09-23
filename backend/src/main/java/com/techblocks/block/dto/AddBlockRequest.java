package com.techblocks.block.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record AddBlockRequest(
        @NotBlank @Pattern(regexp = "MARKDOWN|CODE|MERMAID|API_ENDPOINT|CALLOUT") String type,
        @NotNull JsonNode content,
        @Min(0) Integer position) {
}
