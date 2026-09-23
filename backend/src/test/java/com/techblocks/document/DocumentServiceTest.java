package com.techblocks.document;

import com.techblocks.auth.User;
import com.techblocks.block.Block;
import com.techblocks.block.BlockRepository;
import com.techblocks.block.BlockType;
import com.techblocks.document.dto.CreateDocumentRequest;
import com.techblocks.document.dto.DocumentResponse;
import com.techblocks.document.dto.DocumentTreeResponse;
import com.techblocks.document.dto.UpdateDocumentRequest;
import com.techblocks.workspace.Workspace;
import com.techblocks.workspace.WorkspaceMember;
import com.techblocks.workspace.WorkspaceMemberRepository;
import com.techblocks.workspace.WorkspaceRepository;
import com.techblocks.workspace.Role;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock
    private DocumentRepository documentRepository;
    @Mock
    private BlockRepository blockRepository;
    @Mock
    private WorkspaceRepository workspaceRepository;
    @Mock
    private WorkspaceMemberRepository memberRepository;
    @InjectMocks
    private DocumentService documentService;

    private final UUID userId = UUID.randomUUID();
    private final UUID workspaceId = UUID.randomUUID();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private User user() {
        return User.builder().id(userId).email("alice@example.com").fullName("Alice").build();
    }

    private Workspace workspace() {
        return Workspace.builder().id(workspaceId).name("Backend").slug("backend").owner(user()).build();
    }

    private WorkspaceMember member() {
        return WorkspaceMember.builder().id(UUID.randomUUID()).workspace(workspace()).user(user()).role(Role.ADMIN).build();
    }

    private void stubWorkspaceAndMember() {
        when(workspaceRepository.findById(workspaceId)).thenReturn(Optional.of(workspace()));
        when(memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)).thenReturn(Optional.of(member()));
    }

    private void stubSavedDocumentWithId() {
        when(documentRepository.save(any(Document.class))).thenAnswer(invocation -> {
            Document document = invocation.getArgument(0);
            document.setId(UUID.randomUUID());
            return document;
        });
    }

    @Test
    void shouldCreateDocumentWithDefaultsWhenTitleAndIconAbsent() {
        stubWorkspaceAndMember();
        when(documentRepository.findMaxSiblingPosition(workspaceId, null)).thenReturn(-1);
        stubSavedDocumentWithId();

        DocumentResponse response = documentService.create(workspaceId, userId,
                new CreateDocumentRequest(null, null, null, null));

        assertThat(response.title()).isEqualTo("Document sans titre");
        assertThat(response.icon()).isEqualTo("📄");
        assertThat(response.position()).isZero();
        assertThat(response.workspaceId()).isEqualTo(workspaceId);
    }

    @Test
    void shouldCreateDocumentAtEndWhenSiblingsExist() {
        stubWorkspaceAndMember();
        when(documentRepository.findMaxSiblingPosition(workspaceId, null)).thenReturn(2);
        stubSavedDocumentWithId();

        DocumentResponse response = documentService.create(workspaceId, userId,
                new CreateDocumentRequest("Doc", null, null, null));

        assertThat(response.position()).isEqualTo(3);
    }

    @Test
    void shouldReturnNotFoundWhenParentMissing() {
        stubWorkspaceAndMember();
        UUID parentId = UUID.randomUUID();
        when(documentRepository.findById(parentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> documentService.create(workspaceId, userId,
                new CreateDocumentRequest("Doc", null, parentId, null)))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("statusCode")
                .isEqualTo(org.springframework.http.HttpStatus.NOT_FOUND);
    }

    @Test
    void shouldReturnUnprocessableWhenParentFromAnotherWorkspace() {
        stubWorkspaceAndMember();
        UUID parentId = UUID.randomUUID();
        Workspace otherWorkspace = Workspace.builder().id(UUID.randomUUID()).name("Autre")
                .slug("autre").owner(user()).build();
        Document parent = Document.builder().id(parentId).workspace(otherWorkspace).build();
        when(documentRepository.findById(parentId)).thenReturn(Optional.of(parent));

        assertThatThrownBy(() -> documentService.create(workspaceId, userId,
                new CreateDocumentRequest("Doc", null, parentId, null)))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("statusCode")
                .isEqualTo(org.springframework.http.HttpStatus.UNPROCESSABLE_ENTITY);
    }

    @Test
    void shouldReturnForbiddenWhenRequesterNotMember() {
        when(workspaceRepository.findById(workspaceId)).thenReturn(Optional.of(workspace()));
        when(memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> documentService.create(workspaceId, userId,
                new CreateDocumentRequest("Doc", null, null, null)))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("statusCode")
                .isEqualTo(org.springframework.http.HttpStatus.FORBIDDEN);
    }

    @Test
    void shouldReturnNotFoundWhenWorkspaceMissing() {
        when(workspaceRepository.findById(workspaceId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> documentService.create(workspaceId, userId,
                new CreateDocumentRequest("Doc", null, null, null)))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("statusCode")
                .isEqualTo(org.springframework.http.HttpStatus.NOT_FOUND);
    }

    @Test
    void shouldReturnDocumentWithBlocksOrderedByPosition() throws Exception {
        UUID documentId = UUID.randomUUID();
        Document document = Document.builder().id(documentId).workspace(workspace())
                .title("Doc").icon("📄").position(0).build();
        JsonNode content = objectMapper.readTree("{\"text\":\"coucou\"}");
        Block block = Block.builder().id(UUID.randomUUID()).document(document)
                .type(BlockType.MARKDOWN).content(content).position(0).build();
        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));
        when(memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)).thenReturn(Optional.of(member()));
        when(blockRepository.findByDocumentIdOrderByPositionAsc(documentId)).thenReturn(List.of(block));

        DocumentResponse response = documentService.get(documentId, userId);

        assertThat(response.blocks()).hasSize(1);
        assertThat(response.blocks().get(0).type()).isEqualTo("MARKDOWN");
        assertThat(response.blocks().get(0).content().get("text").asText()).isEqualTo("coucou");
    }

    @Test
    void shouldUpdateTitleAndKeepIconWhenIconAbsent() {
        UUID documentId = UUID.randomUUID();
        Document document = Document.builder().id(documentId).workspace(workspace())
                .title("Ancien").icon("🚀").position(0).build();
        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));
        when(memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)).thenReturn(Optional.of(member()));
        when(documentRepository.save(any(Document.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DocumentResponse response = documentService.update(documentId, userId,
                new UpdateDocumentRequest("Renommé", null));

        assertThat(response.title()).isEqualTo("Renommé");
        assertThat(response.icon()).isEqualTo("🚀");
    }

    @Test
    void shouldDeleteDocument() {
        UUID documentId = UUID.randomUUID();
        Document document = Document.builder().id(documentId).workspace(workspace())
                .title("Doc").icon("📄").position(0).build();
        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document));
        when(memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)).thenReturn(Optional.of(member()));

        documentService.delete(documentId, userId);

        verify(documentRepository).delete(document);
    }

    @Test
    void shouldBuildTreeWithNestedChildren() {
        UUID rootId = UUID.randomUUID();
        UUID childId = UUID.randomUUID();
        Workspace workspace = workspace();
        Document root = Document.builder().id(rootId).workspace(workspace)
                .title("Racine").icon("📄").position(0).build();
        Document child = Document.builder().id(childId).workspace(workspace)
                .parent(root).title("Enfant").icon("📄").position(0).build();
        when(workspaceRepository.existsById(workspaceId)).thenReturn(true);
        when(memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)).thenReturn(Optional.of(member()));
        when(documentRepository.findByWorkspaceIdOrderByPositionAsc(workspaceId)).thenReturn(List.of(root, child));

        List<DocumentTreeResponse> tree = documentService.listTree(workspaceId, userId);

        assertThat(tree).hasSize(1);
        assertThat(tree.get(0).id()).isEqualTo(rootId);
        assertThat(tree.get(0).children()).hasSize(1);
        assertThat(tree.get(0).children().get(0).id()).isEqualTo(childId);
        assertThat(tree.get(0).children().get(0).parentId()).isEqualTo(rootId);
    }
}
