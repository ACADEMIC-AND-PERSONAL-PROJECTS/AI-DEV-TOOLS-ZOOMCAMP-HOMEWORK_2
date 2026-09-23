package com.techblocks.revision;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.techblocks.auth.UserRepository;
import com.techblocks.block.Block;
import com.techblocks.block.BlockRepository;
import com.techblocks.document.Document;
import com.techblocks.document.DocumentRepository;
import com.techblocks.revision.dto.RevisionResponse;
import com.techblocks.workspace.WorkspaceMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RevisionService {

    private final DocumentRevisionRepository revisionRepository;
    private final DocumentRepository documentRepository;
    private final BlockRepository blockRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<RevisionResponse> list(UUID documentId, UUID requesterId) {
        Document document = requireDocument(documentId);
        requireMember(document.getWorkspace().getId(), requesterId);
        return revisionRepository.findByDocumentIdOrderByCreatedAtDesc(documentId).stream()
                .map(RevisionService::toResponse)
                .toList();
    }

    @Transactional
    public RevisionResponse create(UUID documentId, UUID requesterId) {
        Document document = requireDocument(documentId);
        requireMember(document.getWorkspace().getId(), requesterId);
        ObjectNode snapshot = objectMapper.createObjectNode();
        var blocksNode = snapshot.putArray("blocks");
        for (Block block : blockRepository.findByDocumentIdOrderByPositionAsc(documentId)) {
            var node = blocksNode.addObject();
            node.put("type", block.getType().name());
            node.set("content", block.getContent());
            node.put("position", block.getPosition());
        }
        DocumentRevision revision = revisionRepository.save(DocumentRevision.builder()
                .document(document)
                .title(document.getTitle())
                .snapshotJson(snapshot)
                .createdBy(userRepository.getReferenceById(requesterId))
                .build());
        return toResponse(revision);
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

    private static RevisionResponse toResponse(DocumentRevision revision) {
        UUID createdById = revision.getCreatedBy() != null ? revision.getCreatedBy().getId() : null;
        JsonNode snapshot = revision.getSnapshotJson();
        return new RevisionResponse(revision.getId(), revision.getDocument().getId(), revision.getTitle(),
                snapshot, createdById, revision.getCreatedAt());
    }
}
