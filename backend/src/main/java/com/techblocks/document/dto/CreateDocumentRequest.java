package com.techblocks.document.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateDocumentRequest(
        @Size(max = 255) String title,
        @Size(max = 50) String icon,
        UUID parentId,
        @Min(0) Integer position) {
}
