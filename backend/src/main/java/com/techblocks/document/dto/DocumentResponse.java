package com.techblocks.document.dto;

import com.techblocks.block.dto.BlockResponse;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record DocumentResponse(UUID id, UUID workspaceId, UUID parentId, String title, String icon, int position,
                               Instant createdAt, Instant updatedAt, List<BlockResponse> blocks) {
}
