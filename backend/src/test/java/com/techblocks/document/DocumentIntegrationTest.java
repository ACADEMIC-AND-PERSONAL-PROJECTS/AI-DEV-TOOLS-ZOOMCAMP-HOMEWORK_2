package com.techblocks.document;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import com.techblocks.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class DocumentIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    private String registerAndLogin(String email, String fullName) throws Exception {
        String registerBody = objectMapper.writeValueAsString(Map.of(
                "email", email,
                "password", "password123",
                "fullName", fullName));
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
        String body = objectMapper.writeValueAsString(Map.of("name", name));
        MvcResult result = mockMvc.perform(post("/api/v1/workspaces")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
        return JsonPath.read(result.getResponse().getContentAsString(), "$.id");
    }

    private String createDocument(String token, String workspaceId, String body) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/workspaces/{id}/documents", workspaceId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
        return JsonPath.read(result.getResponse().getContentAsString(), "$.id");
    }

    @Test
    void shouldCreateDocumentsAndListTree() throws Exception {
        String token = registerAndLogin("ws-doc-alice@example.com", "Alice Dupont");
        String workspaceId = createWorkspace(token, "Docs Arborescence");

        String rootId = createDocument(token, workspaceId,
                objectMapper.writeValueAsString(Map.of("title", "Doc Racine", "icon", "🚀")));
        String childBody = objectMapper.writeValueAsString(Map.of("title", "Enfant", "parentId", rootId));
        mockMvc.perform(post("/api/v1/workspaces/{id}/documents", workspaceId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(childBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.parentId").value(rootId))
                .andExpect(jsonPath("$.position").value(0));
        createDocument(token, workspaceId,
                objectMapper.writeValueAsString(Map.of("title", "Doc Racine 2")));

        mockMvc.perform(get("/api/v1/workspaces/{id}/documents", workspaceId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Doc Racine"))
                .andExpect(jsonPath("$[0].icon").value("🚀"))
                .andExpect(jsonPath("$[0].children[0].title").value("Enfant"))
                .andExpect(jsonPath("$[1].title").value("Doc Racine 2"))
                .andExpect(jsonPath("$[1].position").value(1));
    }

    @Test
    void shouldGetUpdateAndDeleteDocument() throws Exception {
        String token = registerAndLogin("ws-doc-bob@example.com", "Bob Martin");
        String workspaceId = createWorkspace(token, "Docs Edition");
        String documentId = createDocument(token, workspaceId,
                objectMapper.writeValueAsString(Map.of("title", "À renommer", "icon", "📄")));

        mockMvc.perform(get("/api/v1/documents/{id}", documentId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("À renommer"))
                .andExpect(jsonPath("$.blocks").isArray())
                .andExpect(jsonPath("$.blocks").isEmpty());

        String updateBody = objectMapper.writeValueAsString(Map.of("title", "Renommé", "icon", "⚡"));
        mockMvc.perform(put("/api/v1/documents/{id}", documentId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Renommé"))
                .andExpect(jsonPath("$.icon").value("⚡"));

        mockMvc.perform(delete("/api/v1/documents/{id}", documentId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/documents/{id}", documentId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void shouldReturnForbiddenWhenNotMember() throws Exception {
        String aliceToken = registerAndLogin("ws-doc-carol@example.com", "Carol Vega");
        String workspaceId = createWorkspace(aliceToken, "Docs Privé");
        String documentId = createDocument(aliceToken, workspaceId,
                objectMapper.writeValueAsString(Map.of("title", "Doc Privée")));

        String daveToken = registerAndLogin("ws-doc-dave@example.com", "Dave Liu");

        mockMvc.perform(get("/api/v1/documents/{id}", documentId)
                        .header("Authorization", "Bearer " + daveToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        mockMvc.perform(get("/api/v1/workspaces/{id}/documents", workspaceId)
                        .header("Authorization", "Bearer " + daveToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/v1/workspaces/{id}/documents", workspaceId)
                        .header("Authorization", "Bearer " + daveToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("title", "Intrus"))))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/v1/documents/{id}", documentId)
                        .header("Authorization", "Bearer " + daveToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldReturnNotFoundWhenWorkspaceMissing() throws Exception {
        String token = registerAndLogin("ws-doc-eve@example.com", "Eve Dubois");

        mockMvc.perform(post("/api/v1/workspaces/{id}/documents", UUID.randomUUID())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("title", "Doc"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void shouldReturnUnprocessableWhenParentFromAnotherWorkspace() throws Exception {
        String token = registerAndLogin("ws-doc-frank@example.com", "Frank Zhao");
        String workspaceA = createWorkspace(token, "Workspace A");
        String workspaceB = createWorkspace(token, "Workspace B");
        String foreignDocument = createDocument(token, workspaceB,
                objectMapper.writeValueAsString(Map.of("title", "Doc de B")));

        mockMvc.perform(post("/api/v1/workspaces/{id}/documents", workspaceA)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("title", "Orphelin", "parentId", foreignDocument))))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value(422));
    }

    @Test
    void shouldRejectInvalidUpdateWithProblemDetail() throws Exception {
        String token = registerAndLogin("ws-doc-gina@example.com", "Gina Park");
        String workspaceId = createWorkspace(token, "Docs Validation");
        String documentId = createDocument(token, workspaceId,
                objectMapper.writeValueAsString(Map.of("title", "Doc")));

        mockMvc.perform(put("/api/v1/documents/{id}", documentId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("title", ""))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors").isArray());
    }
}
