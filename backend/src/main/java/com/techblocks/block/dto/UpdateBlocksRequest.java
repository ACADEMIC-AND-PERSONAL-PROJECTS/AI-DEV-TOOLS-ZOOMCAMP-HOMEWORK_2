package com.techblocks.block.dto;

import jakarta.validation.Valid;

import java.util.List;

public record UpdateBlocksRequest(@Valid List<BlockUpsertRequest> blocks) {
}
