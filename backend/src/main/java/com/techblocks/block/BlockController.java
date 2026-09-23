package com.techblocks.block;

import com.techblocks.block.dto.AddBlockRequest;
import com.techblocks.block.dto.BlockResponse;
import com.techblocks.block.dto.UpdateBlocksRequest;
import com.techblocks.security.JwtSubjects;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class BlockController {

    private final BlockService blockService;

    @PutMapping("/documents/{id}/blocks")
    public List<BlockResponse> replaceAll(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
                                          @Valid @RequestBody UpdateBlocksRequest request) {
        return blockService.replaceAll(id, JwtSubjects.userId(jwt), request.blocks());
    }

    @PostMapping("/documents/{id}/blocks")
    @ResponseStatus(HttpStatus.CREATED)
    public BlockResponse add(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
                             @Valid @RequestBody AddBlockRequest request) {
        return blockService.add(id, JwtSubjects.userId(jwt), request);
    }

    @DeleteMapping("/blocks/{blockId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID blockId) {
        blockService.delete(blockId, JwtSubjects.userId(jwt));
    }
}
