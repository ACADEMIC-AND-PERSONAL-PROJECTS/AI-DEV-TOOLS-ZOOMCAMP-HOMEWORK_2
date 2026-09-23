package com.techblocks;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.techblocks.auth.User;
import com.techblocks.auth.UserRepository;
import com.techblocks.block.Block;
import com.techblocks.block.BlockRepository;
import com.techblocks.block.BlockType;
import com.techblocks.document.Document;
import com.techblocks.document.DocumentRepository;
import com.techblocks.revision.DocumentRevision;
import com.techblocks.revision.DocumentRevisionRepository;
import com.techblocks.workspace.Role;
import com.techblocks.workspace.Workspace;
import com.techblocks.workspace.WorkspaceMember;
import com.techblocks.workspace.WorkspaceMemberRepository;
import com.techblocks.workspace.WorkspaceRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class EntityPersistenceTest extends AbstractIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private WorkspaceMemberRepository workspaceMemberRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private BlockRepository blockRepository;

    @Autowired
    private DocumentRevisionRepository documentRevisionRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldPersistFullEntityGraph() throws Exception {
        User user = userRepository.save(User.builder()
                .email("jane@tech.com")
                .passwordHash("hashed")
                .fullName("Jane Doe")
                .build());
        assertThat(user.getId()).isNotNull();
        assertThat(user.getCreatedAt()).isNotNull();

        Workspace workspace = workspaceRepository.save(Workspace.builder()
                .name("Mon espace")
                .slug("mon-espace")
                .owner(user)
                .build());

        WorkspaceMember member = workspaceMemberRepository.save(WorkspaceMember.builder()
                .workspace(workspace)
                .user(user)
                .role(Role.ADMIN)
                .build());
        assertThat(workspaceMemberRepository.findByWorkspaceId(workspace.getId()))
                .extracting(WorkspaceMember::getRole)
                .containsExactly(Role.ADMIN);

        Document parent = documentRepository.save(Document.builder()
                .workspace(workspace)
                .createdBy(user)
                .build());
        assertThat(parent.getTitle()).isEqualTo("Document sans titre");
        assertThat(parent.getIcon()).isEqualTo("📄");

        Document child = documentRepository.save(Document.builder()
                .workspace(workspace)
                .parent(parent)
                .createdBy(user)
                .title("Architecture")
                .position(1)
                .build());

        blockRepository.saveAll(List.of(
                Block.builder().document(child).type(BlockType.MARKDOWN).position(0)
                        .content(json("{\"text\": \"## Introduction\"}")).build(),
                Block.builder().document(child).type(BlockType.CODE).position(1)
                        .content(json("{\"language\": \"typescript\", \"code\": \"const greet = () => 'hi';\", \"showLineNumbers\": true, \"fileName\": \"utils/greet.ts\"}")).build(),
                Block.builder().document(child).type(BlockType.MERMAID).position(2)
                        .content(json("{\"code\": \"graph TD;\\n  A[Client] -->|REST| B(Spring Boot);\"}")).build(),
                Block.builder().document(child).type(BlockType.API_ENDPOINT).position(3)
                        .content(json("{\"method\": \"POST\", \"endpoint\": \"/api/v1/auth/login\", \"summary\": \"Login\", \"headers\": [{\"key\": \"Content-Type\", \"value\": \"application/json\"}], \"requestBody\": \"{}\", \"responseExample\": \"{}\"}")).build(),
                Block.builder().document(child).type(BlockType.CALLOUT).position(4)
                        .content(json("{\"variant\": \"WARNING\", \"title\": \"Attention\", \"message\": \"Rate limiting.\"}")).build()
        ));

        List<Block> blocks = blockRepository.findByDocumentIdOrderByPositionAsc(child.getId());
        assertThat(blocks).hasSize(5);
        assertThat(blocks).extracting(Block::getType).containsExactly(
                BlockType.MARKDOWN, BlockType.CODE, BlockType.MERMAID, BlockType.API_ENDPOINT, BlockType.CALLOUT);
        assertThat(blocks.get(1).getContent().path("language").asText()).isEqualTo("typescript");
        assertThat(blocks.get(4).getContent().path("variant").asText()).isEqualTo("WARNING");

        documentRevisionRepository.save(DocumentRevision.builder()
                .document(child)
                .title("Snapshot v1")
                .snapshotJson(json("{\"blocks\": []}"))
                .createdBy(user)
                .build());
        assertThat(documentRevisionRepository.findByDocumentIdOrderByCreatedAtDesc(child.getId())).hasSize(1);

        assertThat(documentRepository.findByWorkspaceIdOrderByPositionAsc(workspace.getId()))
                .extracting(Document::getTitle)
                .containsExactly("Document sans titre", "Architecture");
    }

    private JsonNode json(String value) throws Exception {
        return objectMapper.readTree(value);
    }
}
