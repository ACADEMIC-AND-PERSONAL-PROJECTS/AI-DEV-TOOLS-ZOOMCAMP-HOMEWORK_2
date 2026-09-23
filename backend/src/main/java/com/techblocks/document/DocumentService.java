package com.techblocks.document;

import com.techblocks.block.Block;
import com.techblocks.block.BlockRepository;
import com.techblocks.block.dto.BlockResponse;
import com.techblocks.document.dto.CreateDocumentRequest;
import com.techblocks.document.dto.DocumentResponse;
import com.techblocks.document.dto.DocumentTreeResponse;
import com.techblocks.document.dto.UpdateDocumentRequest;
import com.techblocks.workspace.Workspace;
import com.techblocks.workspace.WorkspaceMemberRepository;
import com.techblocks.workspace.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private static final UUID NULL_PARENT = new UUID(0, 0);

    private final DocumentRepository documentRepository;
    private final BlockRepository blockRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository memberRepository;

    @Transactional(readOnly = true)
    public List<DocumentTreeResponse> listTree(UUID workspaceId, UUID requesterId) {
        requireWorkspace(workspaceId);
        requireMember(workspaceId, requesterId);
        List<Document> documents = documentRepository.findByWorkspaceIdOrderByPositionAsc(workspaceId);
        Map<UUID, List<Document>> byParent = documents.stream()
                .collect(Collectors.groupingBy(document -> parentKey(document.getParent())));
        return buildChildren(NULL_PARENT, byParent);
    }

    @Transactional
    public DocumentResponse create(UUID workspaceId, UUID requesterId, CreateDocumentRequest request) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workspace introuvable"));
        requireMember(workspaceId, requesterId);
        Document parent = null;
        if (request.parentId() != null) {
            parent = documentRepository.findById(request.parentId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document parent introuvable"));
            if (!parent.getWorkspace().getId().equals(workspaceId)) {
                throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                        "Le document parent n'appartient pas à ce workspace");
            }
        }
        int position = request.position() != null
                ? request.position()
                : documentRepository.findMaxSiblingPosition(workspaceId, request.parentId()) + 1;
        String title = request.title() == null || request.title().isBlank() ? "Document sans titre" : request.title().trim();
        String icon = request.icon() == null || request.icon().isBlank() ? "📄" : request.icon().trim();
        Document document = documentRepository.save(Document.builder()
                .workspace(workspace)
                .parent(parent)
                .title(title)
                .icon(icon)
                .position(position)
                .build());
        return toResponse(document);
    }

    @Transactional(readOnly = true)
    public DocumentResponse get(UUID id, UUID requesterId) {
        Document document = requireDocument(id);
        requireMember(document.getWorkspace().getId(), requesterId);
        return toResponse(document);
    }

    @Transactional
    public DocumentResponse update(UUID id, UUID requesterId, UpdateDocumentRequest request) {
        Document document = requireDocument(id);
        requireMember(document.getWorkspace().getId(), requesterId);
        document.setTitle(request.title().trim());
        if (request.icon() != null && !request.icon().isBlank()) {
            document.setIcon(request.icon().trim());
        }
        return toResponse(documentRepository.save(document));
    }

    @Transactional
    public void delete(UUID id, UUID requesterId) {
        Document document = requireDocument(id);
        requireMember(document.getWorkspace().getId(), requesterId);
        documentRepository.delete(document);
    }

    private Document requireDocument(UUID id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document introuvable"));
    }

    private void requireWorkspace(UUID workspaceId) {
        if (!workspaceRepository.existsById(workspaceId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Workspace introuvable");
        }
    }

    private void requireMember(UUID workspaceId, UUID requesterId) {
        if (memberRepository.findByWorkspaceIdAndUserId(workspaceId, requesterId).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'êtes pas membre de ce workspace");
        }
    }

    private UUID parentKey(Document parent) {
        return parent == null ? NULL_PARENT : parent.getId();
    }

    private List<DocumentTreeResponse> buildChildren(UUID parentKey, Map<UUID, List<Document>> byParent) {
        return byParent.getOrDefault(parentKey, List.of()).stream()
                .map(document -> new DocumentTreeResponse(document.getId(),
                        document.getParent() == null ? null : document.getParent().getId(),
                        document.getTitle(), document.getIcon(), document.getPosition(), document.getUpdatedAt(),
                        buildChildren(document.getId(), byParent)))
                .toList();
    }

    private DocumentResponse toResponse(Document document) {
        List<BlockResponse> blocks = blockRepository.findByDocumentIdOrderByPositionAsc(document.getId()).stream()
                .map(DocumentService::toBlockResponse)
                .toList();
        return new DocumentResponse(document.getId(), document.getWorkspace().getId(),
                document.getParent() == null ? null : document.getParent().getId(),
                document.getTitle(), document.getIcon(), document.getPosition(),
                document.getCreatedAt(), document.getUpdatedAt(), blocks);
    }

    private static BlockResponse toBlockResponse(Block block) {
        return new BlockResponse(block.getId(), block.getType().name(), block.getContent(),
                block.getPosition(), block.getCreatedAt(), block.getUpdatedAt());
    }
}
