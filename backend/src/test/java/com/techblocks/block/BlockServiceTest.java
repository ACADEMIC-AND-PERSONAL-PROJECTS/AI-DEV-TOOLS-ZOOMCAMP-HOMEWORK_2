package com.techblocks.block;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.techblocks.auth.User;
import com.techblocks.block.dto.AddBlockRequest;
import com.techblocks.block.dto.BlockResponse;
import com.techblocks.block.dto.BlockUpsertRequest;
import com.techblocks.document.Document;
import com.techblocks.document.DocumentRepository;
import com.techblocks.workspace.Workspace;
import com.techblocks.workspace.WorkspaceMember;
import com.techblocks.workspace.WorkspaceMemberRepository;
import com.techblocks.workspace.Role;
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
class BlockServiceTest {

    @Mock
    private BlockRepository blockRepository;
    @Mock
    private DocumentRepository documentRepository;
    @Mock
    private WorkspaceMemberRepository memberRepository;
    @Mock
    private BlockContentValidator contentValidator;
    @InjectMocks
    private BlockService blockService;

    private final UUID userId = UUID.randomUUID();
    private final UUID workspaceId = UUID.randomUUID();
    private final UUID documentId = UUID.randomUUID();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private Workspace workspace() {
        return Workspace.builder().id(workspaceId).name("Backend").slug("backend")
                .owner(User.builder().id(userId).build()).build();
    }

    private Document document() {
        return Document.builder().id(documentId).workspace(workspace())
                .title("Doc").icon("📄").position(0).build();
    }

    private void stubMember() {
        when(memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)).thenReturn(Optional.of(
                WorkspaceMember.builder().id(UUID.randomUUID()).workspace(workspace())
                        .user(User.builder().id(userId).build()).role(Role.ADMIN).build()));
    }

    private JsonNode markdown(String text) throws Exception {
        return objectMapper.readTree("{\"text\":\"" + text + "\"}");
    }

    @Test
    void shouldReplaceAllBlocksKeepExistingIdsAndDeleteRemoved() throws Exception {
        stubMember();
        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document()));
        UUID keptId = UUID.randomUUID();
        UUID removedId = UUID.randomUUID();
        Block kept = Block.builder().id(keptId).document(document()).type(BlockType.MARKDOWN)
                .content(markdown("ancien")).position(0).build();
        Block removed = Block.builder().id(removedId).document(document()).type(BlockType.MARKDOWN)
                .content(markdown("à supprimer")).position(1).build();
        when(blockRepository.findByDocumentIdOrderByPositionAsc(documentId)).thenReturn(List.of(kept, removed));
        when(blockRepository.save(any(Block.class))).thenAnswer(invocation -> {
            Block block = invocation.getArgument(0);
            block.setId(UUID.randomUUID());
            return block;
        });

        List<BlockResponse> responses = blockService.replaceAll(documentId, userId, List.of(
                new BlockUpsertRequest(keptId, "MARKDOWN", markdown("mis à jour")),
                new BlockUpsertRequest(null, "CODE", objectMapper.readTree("{\"language\":\"java\",\"code\":\"x\"}"))));

        assertThat(responses).hasSize(2);
        assertThat(responses.get(0).id()).isEqualTo(keptId);
        assertThat(responses.get(0).content().get("text").asText()).isEqualTo("mis à jour");
        assertThat(responses.get(0).position()).isZero();
        assertThat(responses.get(1).type()).isEqualTo("CODE");
        assertThat(responses.get(1).position()).isEqualTo(1);
        verify(blockRepository).delete(removed);
    }

    @Test
    void shouldReturnUnprocessableWhenContentDoesNotMatchType() throws Exception {
        stubMember();
        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document()));
        when(blockRepository.findByDocumentIdOrderByPositionAsc(documentId)).thenReturn(List.of());
        org.mockito.Mockito.doThrow(new ResponseStatusException(org.springframework.http.HttpStatus.UNPROCESSABLE_ENTITY,
                        "Contenu de bloc invalide"))
                .when(contentValidator).validate(any(BlockType.class), any(JsonNode.class));

        assertThatThrownBy(() -> blockService.replaceAll(documentId, userId,
                List.of(new BlockUpsertRequest(null, "MARKDOWN", markdown("x")))))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("statusCode")
                .isEqualTo(org.springframework.http.HttpStatus.UNPROCESSABLE_ENTITY);
    }

    @Test
    void shouldReturnUnprocessableWhenDuplicateIdInPayload() throws Exception {
        stubMember();
        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document()));
        UUID keptId = UUID.randomUUID();
        Block kept = Block.builder().id(keptId).document(document()).type(BlockType.MARKDOWN)
                .content(markdown("x")).position(0).build();
        when(blockRepository.findByDocumentIdOrderByPositionAsc(documentId)).thenReturn(List.of(kept));

        assertThatThrownBy(() -> blockService.replaceAll(documentId, userId, List.of(
                new BlockUpsertRequest(keptId, "MARKDOWN", markdown("a")),
                new BlockUpsertRequest(keptId, "MARKDOWN", markdown("b")))))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("statusCode")
                .isEqualTo(org.springframework.http.HttpStatus.UNPROCESSABLE_ENTITY);
    }

    @Test
    void shouldAddBlockAtEndWhenPositionAbsent() throws Exception {
        stubMember();
        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document()));
        when(blockRepository.findMaxPosition(documentId)).thenReturn(2);
        when(blockRepository.save(any(Block.class))).thenAnswer(invocation -> {
            Block block = invocation.getArgument(0);
            block.setId(UUID.randomUUID());
            return block;
        });

        BlockResponse response = blockService.add(documentId, userId,
                new AddBlockRequest("CALLOUT", objectMapper.readTree(
                        "{\"variant\":\"INFO\",\"title\":\"t\",\"message\":\"m\"}"), null));

        assertThat(response.position()).isEqualTo(3);
        assertThat(response.type()).isEqualTo("CALLOUT");
    }

    @Test
    void shouldAddBlockAtGivenPosition() throws Exception {
        stubMember();
        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document()));
        when(blockRepository.save(any(Block.class))).thenAnswer(invocation -> {
            Block block = invocation.getArgument(0);
            block.setId(UUID.randomUUID());
            return block;
        });

        BlockResponse response = blockService.add(documentId, userId,
                new AddBlockRequest("MARKDOWN", markdown("x"), 0));

        assertThat(response.position()).isZero();
    }

    @Test
    void shouldDeleteBlock() throws Exception {
        Block block = Block.builder().id(UUID.randomUUID()).document(document())
                .type(BlockType.MARKDOWN).content(markdown("x")).position(0).build();
        when(blockRepository.findById(block.getId())).thenReturn(Optional.of(block));
        when(memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)).thenReturn(Optional.of(
                WorkspaceMember.builder().id(UUID.randomUUID()).workspace(workspace())
                        .user(User.builder().id(userId).build()).role(Role.ADMIN).build()));

        blockService.delete(block.getId(), userId);

        verify(blockRepository).delete(block);
    }

    @Test
    void shouldReturnNotFoundWhenBlockMissing() {
        UUID blockId = UUID.randomUUID();
        when(blockRepository.findById(blockId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> blockService.delete(blockId, userId))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("statusCode")
                .isEqualTo(org.springframework.http.HttpStatus.NOT_FOUND);
    }

    @Test
    void shouldReturnForbiddenWhenNotMember() throws Exception {
        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document()));
        when(memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> blockService.replaceAll(documentId, userId, List.of()))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("statusCode")
                .isEqualTo(org.springframework.http.HttpStatus.FORBIDDEN);

        assertThatThrownBy(() -> blockService.add(documentId, userId,
                new AddBlockRequest("MARKDOWN", markdown("x"), null)))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("statusCode")
                .isEqualTo(org.springframework.http.HttpStatus.FORBIDDEN);
    }
}
