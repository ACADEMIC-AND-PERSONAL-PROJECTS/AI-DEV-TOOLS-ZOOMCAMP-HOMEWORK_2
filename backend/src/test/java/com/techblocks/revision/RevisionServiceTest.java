package com.techblocks.revision;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.techblocks.auth.User;
import com.techblocks.auth.UserRepository;
import com.techblocks.block.Block;
import com.techblocks.block.BlockRepository;
import com.techblocks.block.BlockType;
import com.techblocks.document.Document;
import com.techblocks.document.DocumentRepository;
import com.techblocks.revision.dto.RevisionResponse;
import com.techblocks.workspace.Role;
import com.techblocks.workspace.Workspace;
import com.techblocks.workspace.WorkspaceMember;
import com.techblocks.workspace.WorkspaceMemberRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RevisionServiceTest {

    @Mock
    private DocumentRevisionRepository revisionRepository;
    @Mock
    private DocumentRepository documentRepository;
    @Mock
    private BlockRepository blockRepository;
    @Mock
    private WorkspaceMemberRepository memberRepository;
    @Mock
    private UserRepository userRepository;
    @InjectMocks
    private RevisionService revisionService;

    private final UUID userId = UUID.randomUUID();
    private final UUID workspaceId = UUID.randomUUID();
    private final UUID documentId = UUID.randomUUID();
    @Spy
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final ObjectMapper RAW_MAPPER = new ObjectMapper();

    private Workspace workspace() {
        return Workspace.builder().id(workspaceId).name("Backend").slug("backend")
                .owner(User.builder().id(userId).build()).build();
    }

    private Document document() {
        return Document.builder().id(documentId).workspace(workspace())
                .title("Doc Révisions").icon("📄").position(0).build();
    }

    private void stubMember() {
        when(memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)).thenReturn(Optional.of(
                WorkspaceMember.builder().id(UUID.randomUUID()).workspace(workspace())
                        .user(User.builder().id(userId).build()).role(Role.ADMIN).build()));
    }

    private DocumentRevision revision(String title, Instant createdAt) throws Exception {
        return DocumentRevision.builder()
                .id(UUID.randomUUID())
                .document(document())
                .title(title)
                .snapshotJson(RAW_MAPPER.readTree("{\"blocks\":[]}"))
                .createdAt(createdAt)
                .build();
    }

    @Test
    void shouldListRevisionsWhenMember() throws Exception {
        stubMember();
        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document()));
        Instant older = Instant.parse("2026-09-22T10:00:00Z");
        Instant newer = Instant.parse("2026-09-23T10:00:00Z");
        when(revisionRepository.findByDocumentIdOrderByCreatedAtDesc(documentId))
                .thenReturn(List.of(revision("V2", newer), revision("V1", older)));

        List<RevisionResponse> responses = revisionService.list(documentId, userId);

        assertThat(responses).hasSize(2);
        assertThat(responses.get(0).title()).isEqualTo("V2");
        assertThat(responses.get(1).title()).isEqualTo("V1");
        assertThat(responses.get(0).documentId()).isEqualTo(documentId);
    }

    @Test
    void shouldReturnNotFoundWhenDocumentMissingForList() {
        when(documentRepository.findById(documentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> revisionService.list(documentId, userId))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("statusCode")
                .isEqualTo(org.springframework.http.HttpStatus.NOT_FOUND);
    }

    @Test
    void shouldReturnNotFoundWhenDocumentMissingForCreate() {
        when(documentRepository.findById(documentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> revisionService.create(documentId, userId))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("statusCode")
                .isEqualTo(org.springframework.http.HttpStatus.NOT_FOUND);
    }

    @Test
    void shouldReturnForbiddenWhenNotMember() {
        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document()));
        when(memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> revisionService.list(documentId, userId))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("statusCode")
                .isEqualTo(org.springframework.http.HttpStatus.FORBIDDEN);

        assertThatThrownBy(() -> revisionService.create(documentId, userId))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("statusCode")
                .isEqualTo(org.springframework.http.HttpStatus.FORBIDDEN);
    }

    @Test
    void shouldCreateSnapshotFromCurrentBlocks() throws Exception {
        stubMember();
        when(documentRepository.findById(documentId)).thenReturn(Optional.of(document()));
        Block markdown = Block.builder().id(UUID.randomUUID()).document(document())
                .type(BlockType.MARKDOWN).content(objectMapper.readTree("{\"text\":\"intro\"}")).position(0).build();
        Block code = Block.builder().id(UUID.randomUUID()).document(document())
                .type(BlockType.CODE)
                .content(objectMapper.readTree("{\"language\":\"java\",\"code\":\"x\"}")).position(1).build();
        when(blockRepository.findByDocumentIdOrderByPositionAsc(documentId)).thenReturn(List.of(markdown, code));
        User user = User.builder().id(userId).build();
        when(userRepository.getReferenceById(userId)).thenReturn(user);
        when(revisionRepository.save(any(DocumentRevision.class))).thenAnswer(invocation -> {
            DocumentRevision saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            saved.setCreatedAt(Instant.now());
            return saved;
        });

        RevisionResponse response = revisionService.create(documentId, userId);

        assertThat(response.title()).isEqualTo("Doc Révisions");
        assertThat(response.createdBy()).isEqualTo(userId);
        assertThat(response.snapshot().get("blocks")).hasSize(2);
        assertThat(response.snapshot().get("blocks").get(1).get("type").asText()).isEqualTo("CODE");
        assertThat(response.snapshot().get("blocks").get(0).get("position").asInt()).isZero();
    }
}
