package com.techblocks.document.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record DocumentTreeResponse(UUID id, UUID parentId, String title, String icon, int position, Instant updatedAt,
                                   List<DocumentTreeResponse> children) {
}
