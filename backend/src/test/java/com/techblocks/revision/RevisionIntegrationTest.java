package com.techblocks.revision;

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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class RevisionIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    private String registerAndLogin(String email) throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", email,
                                "password", "password123",
                                "fullName", "Testeur"))))
                .andExpect(status().isCreated());
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", email,
                                "password", "password123"))))
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
    void shouldSaveAndListSnapshots() throws Exception {
        String token = registerAndLogin("ws-rev-alice@example.com");
        String workspaceId = createWorkspace(token, "Révisions Workspace");
        String documentId = createDocument(token, workspaceId, "Doc Révisions");

        mockMvc.perform(put("/api/v1/documents/{id}/blocks", documentId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("blocks", List.of(
                                Map.of("type", "MARKDOWN", "content", Map.of("text", "v1")),
                                Map.of("type", "CODE", "content", Map.of("language", "java", "code", "x")))))))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/documents/{id}/revisions", documentId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Doc Révisions"))
                .andExpect(jsonPath("$.snapshot.blocks.length()").value(2))
                .andExpect(jsonPath("$.snapshot.blocks[0].type").value("MARKDOWN"))
                .andExpect(jsonPath("$.createdBy").exists());

        mockMvc.perform(get("/api/v1/documents/{id}/revisions", documentId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

        mockMvc.perform(put("/api/v1/documents/{id}/blocks", documentId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("blocks", List.of(
                                Map.of("type", "MERMAID", "content", Map.of("code", "graph TD; A-->B;")))))))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/documents/{id}/revisions", documentId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/documents/{id}/revisions", documentId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].snapshot.blocks.length()").value(1))
                .andExpect(jsonPath("$[0].snapshot.blocks[0].type").value("MERMAID"))
                .andExpect(jsonPath("$[1].snapshot.blocks.length()").value(2));
    }

    @Test
    void shouldReturnForbiddenWhenNotMember() throws Exception {
        String aliceToken = registerAndLogin("ws-rev-bob@example.com");
        String workspaceId = createWorkspace(aliceToken, "Révisions Privé");
        String documentId = createDocument(aliceToken, workspaceId, "Doc Privée");
        String carolToken = registerAndLogin("ws-rev-carol@example.com");

        mockMvc.perform(get("/api/v1/documents/{id}/revisions", documentId)
                        .header("Authorization", "Bearer " + carolToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        mockMvc.perform(post("/api/v1/documents/{id}/revisions", documentId)
                        .header("Authorization", "Bearer " + carolToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldReturnNotFoundWhenDocumentMissing() throws Exception {
        String token = registerAndLogin("ws-rev-dave@example.com");

        mockMvc.perform(get("/api/v1/documents/{id}/revisions", UUID.randomUUID())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));

        mockMvc.perform(post("/api/v1/documents/{id}/revisions", UUID.randomUUID())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }
}
