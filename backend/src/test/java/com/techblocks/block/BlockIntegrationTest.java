package com.techblocks.block;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import com.techblocks.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class BlockIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    private String registerAndLogin(String email) throws Exception {
        String registerBody = objectMapper.writeValueAsString(Map.of(
                "email", email,
                "password", "password123",
                "fullName", "Testeur"));
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isCreated());
        String loginBody = objectMapper.writeValueAsString(Map.of(
                "email", email,
                "password", "password123"));
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isOk())
                .andReturn();
        return JsonPath.read(loginResult.getResponse().getContentAsString(), "$.token");
    }

    private String createWorkspace(String token, String name) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/workspaces")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name", name))))
                .andExpect(status().isCreated())
                .andReturn();
        return JsonPath.read(result.getResponse().getContentAsString(), "$.id");
    }

    private String createDocument(String token, String workspaceId, String title) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/workspaces/{id}/documents", workspaceId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("title", title))))
                .andExpect(status().isCreated())
                .andReturn();
        return JsonPath.read(result.getResponse().getContentAsString(), "$.id");
    }

    @Test
    void shouldAutosaveReorderAndDeleteBlocks() throws Exception {
        String token = registerAndLogin("ws-blk-alice@example.com");
        String workspaceId = createWorkspace(token, "Blocs Workspace");
        String documentId = createDocument(token, workspaceId, "Doc Blocs");

        String initial = objectMapper.writeValueAsString(Map.of("blocks", List.of(
                Map.of("type", "MARKDOWN", "content", Map.of("text", "# Titre")),
                Map.of("type", "CODE", "content", Map.of(
                        "language", "typescript",
                        "code", "const x = 1;",
                        "showLineNumbers", false,
                        "fileName", "greet.ts")))));
        MvcResult putResult = mockMvc.perform(put("/api/v1/documents/{id}/blocks", documentId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(initial))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("MARKDOWN"))
                .andExpect(jsonPath("$[0].position").value(0))
                .andExpect(jsonPath("$[1].type").value("CODE"))
                .andExpect(jsonPath("$[1].position").value(1))
                .andReturn();
        String body = putResult.getResponse().getContentAsString();
        String markdownId = JsonPath.read(body, "$[0].id");
        String codeId = JsonPath.read(body, "$[1].id");

        String reordered = objectMapper.writeValueAsString(Map.of("blocks", List.of(
                Map.of("id", codeId, "type", "CODE", "content", Map.of("language", "typescript", "code", "const x = 1;")),
                Map.of("id", markdownId, "type", "MARKDOWN", "content", Map.of("text", "# Titre mis à jour")))));
        mockMvc.perform(put("/api/v1/documents/{id}/blocks", documentId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reordered))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(codeId))
                .andExpect(jsonPath("$[0].position").value(0))
                .andExpect(jsonPath("$[1].id").value(markdownId))
                .andExpect(jsonPath("$[1].position").value(1))
                .andExpect(jsonPath("$[1].content.text").value("# Titre mis à jour"));

        String pruned = objectMapper.writeValueAsString(Map.of("blocks", List.of(
                Map.of("id", markdownId, "type", "MARKDOWN", "content", Map.of("text", "# Seul")))));
        mockMvc.perform(put("/api/v1/documents/{id}/blocks", documentId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(pruned))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(markdownId));

        mockMvc.perform(get("/api/v1/documents/{id}", documentId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.blocks").isArray())
                .andExpect(jsonPath("$.blocks.length()").value(1));

        String callout = objectMapper.writeValueAsString(Map.of(
                "type", "CALLOUT",
                "content", Map.of("variant", "WARNING", "title", "Attention", "message", "Rate limit")));
        MvcResult addResult = mockMvc.perform(post("/api/v1/documents/{id}/blocks", documentId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(callout))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.type").value("CALLOUT"))
                .andExpect(jsonPath("$.position").value(1))
                .andReturn();
        String calloutId = JsonPath.read(addResult.getResponse().getContentAsString(), "$.id");

        mockMvc.perform(delete("/api/v1/blocks/{blockId}", calloutId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        mockMvc.perform(delete("/api/v1/blocks/{blockId}", calloutId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void shouldRejectInvalidTypeAndContent() throws Exception {
        String token = registerAndLogin("ws-blk-bob@example.com");
        String workspaceId = createWorkspace(token, "Blocs Validation");
        String documentId = createDocument(token, workspaceId, "Doc Valide");

        String invalidType = objectMapper.writeValueAsString(Map.of("blocks", List.of(
                Map.of("type", "FOO", "content", Map.of("text", "x")))));
        mockMvc.perform(put("/api/v1/documents/{id}/blocks", documentId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidType))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors").isArray());

        String invalidContent = objectMapper.writeValueAsString(Map.of("blocks", List.of(
                Map.of("type", "MERMAID", "content", Map.of("text", "pas de code")))));
        mockMvc.perform(put("/api/v1/documents/{id}/blocks", documentId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidContent))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value(422));
    }

    @Test
    void shouldReturnForbiddenWhenNotMember() throws Exception {
        String aliceToken = registerAndLogin("ws-blk-carol@example.com");
        String workspaceId = createWorkspace(aliceToken, "Blocs Privé");
        String documentId = createDocument(aliceToken, workspaceId, "Doc Privée");
        String daveToken = registerAndLogin("ws-blk-dave@example.com");

        String body = objectMapper.writeValueAsString(Map.of("blocks", List.of(
                Map.of("type", "MARKDOWN", "content", Map.of("text", "x")))));
        mockMvc.perform(put("/api/v1/documents/{id}/blocks", documentId)
                        .header("Authorization", "Bearer " + daveToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        mockMvc.perform(post("/api/v1/documents/{id}/blocks", documentId)
                        .header("Authorization", "Bearer " + daveToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "type", "MARKDOWN", "content", Map.of("text", "x")))))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/v1/blocks/{blockId}", UUID.randomUUID())
                        .header("Authorization", "Bearer " + daveToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldReturnNotFoundWhenDocumentMissing() throws Exception {
        String token = registerAndLogin("ws-blk-eve@example.com");

        String body = objectMapper.writeValueAsString(Map.of("blocks", List.of(
                Map.of("type", "MARKDOWN", "content", Map.of("text", "x")))));
        mockMvc.perform(put("/api/v1/documents/{id}/blocks", UUID.randomUUID())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }
}
