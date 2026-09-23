package com.techblocks.document.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateDocumentRequest(
        @NotBlank @Size(max = 255) String title,
        @Size(max = 50) String icon) {
}
