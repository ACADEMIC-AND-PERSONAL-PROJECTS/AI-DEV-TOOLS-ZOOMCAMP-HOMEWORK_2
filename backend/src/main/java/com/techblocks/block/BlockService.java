package com.techblocks.block;

import com.techblocks.block.dto.AddBlockRequest;
import com.techblocks.block.dto.BlockResponse;
import com.techblocks.block.dto.BlockUpsertRequest;
import com.techblocks.document.Document;
import com.techblocks.document.DocumentRepository;
import com.techblocks.workspace.WorkspaceMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BlockService {

    private final BlockRepository blockRepository;
    private final DocumentRepository documentRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final BlockContentValidator contentValidator;

    @Transactional
    public List<BlockResponse> replaceAll(UUID documentId, UUID requesterId, List<BlockUpsertRequest> requests) {
        Document document = requireDocument(documentId);
        requireMember(document.getWorkspace().getId(), requesterId);
        List<Block> existing = blockRepository.findByDocumentIdOrderByPositionAsc(documentId);
        Map<UUID, Block> byId = existing.stream()
                .collect(Collectors.toMap(Block::getId, Function.identity()));
        Set<UUID> keptIds = new HashSet<>();
        List<Block> result = new ArrayList<>();
        for (int i = 0; i < requests.size(); i++) {
            BlockUpsertRequest request = requests.get(i);
            BlockType type = BlockType.valueOf(request.type());
            contentValidator.validate(type, request.content());
            Block block;
            if (request.id() != null && byId.containsKey(request.id())) {
                if (!keptIds.add(request.id())) {
                    throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                            "Bloc dupliqué dans la liste : " + request.id());
                }
                block = byId.get(request.id());
                block.setType(type);
                block.setContent(request.content());
                block.setPosition(i);
            } else {
                block = blockRepository.save(Block.builder()
                        .document(document)
                        .type(type)
                        .content(request.content())
                        .position(i)
                        .build());
            }
            result.add(block);
        }
        existing.stream()
                .filter(block -> !keptIds.contains(block.getId()))
                .forEach(blockRepository::delete);
        return result.stream().map(BlockService::toResponse).toList();
    }

    @Transactional
    public BlockResponse add(UUID documentId, UUID requesterId, AddBlockRequest request) {
        Document document = requireDocument(documentId);
        requireMember(document.getWorkspace().getId(), requesterId);
        BlockType type = BlockType.valueOf(request.type());
        contentValidator.validate(type, request.content());
        int position = request.position() != null
                ? request.position()
                : blockRepository.findMaxPosition(documentId) + 1;
        Block block = blockRepository.save(Block.builder()
                .document(document)
                .type(type)
                .content(request.content())
                .position(position)
                .build());
        return toResponse(block);
    }

    @Transactional
    public void delete(UUID blockId, UUID requesterId) {
        Block block = blockRepository.findById(blockId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bloc introuvable"));
        requireMember(block.getDocument().getWorkspace().getId(), requesterId);
        blockRepository.delete(block);
    }

    private Document requireDocument(UUID documentId) {
        return documentRepository.findById(documentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document introuvable"));
    }

    private void requireMember(UUID workspaceId, UUID requesterId) {
        if (memberRepository.findByWorkspaceIdAndUserId(workspaceId, requesterId).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'êtes pas membre de ce workspace");
        }
    }

    private static BlockResponse toResponse(Block block) {
        return new BlockResponse(block.getId(), block.getType().name(), block.getContent(),
                block.getPosition(), block.getCreatedAt(), block.getUpdatedAt());
    }
}
