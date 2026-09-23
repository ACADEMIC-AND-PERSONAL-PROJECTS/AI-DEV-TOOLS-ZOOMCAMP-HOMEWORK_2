package com.techblocks.workspace;

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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class WorkspaceIntegrationTest extends AbstractIntegrationTest {

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

    @Test
    void shouldCreateListWorkspaceAndListMembers() throws Exception {
        String aliceToken = registerAndLogin("ws-alice@example.com", "Alice Dupont");

        String createBody = objectMapper.writeValueAsString(Map.of("name", "Équipe Backend"));
        MvcResult createResult = mockMvc.perform(post("/api/v1/workspaces")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.name").value("Équipe Backend"))
                .andExpect(jsonPath("$.slug").value("equipe-backend"))
                .andReturn();
        String workspaceId = JsonPath.read(createResult.getResponse().getContentAsString(), "$.id");

        mockMvc.perform(get("/api/v1/workspaces")
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Équipe Backend"))
                .andExpect(jsonPath("$[0].slug").value("equipe-backend"));

        mockMvc.perform(get("/api/v1/workspaces/{id}/members", workspaceId)
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].role").value("ADMIN"))
                .andExpect(jsonPath("$[0].email").value("ws-alice@example.com"));
    }

    @Test
    void shouldReturnForbiddenWhenListingMembersOfNonMember() throws Exception {
        String aliceToken = registerAndLogin("ws-bob@example.com", "Bob Martin");

        String createBody = objectMapper.writeValueAsString(Map.of("name", "Workspace Privé"));
        MvcResult createResult = mockMvc.perform(post("/api/v1/workspaces")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody))
                .andExpect(status().isCreated())
                .andReturn();
        String workspaceId = JsonPath.read(createResult.getResponse().getContentAsString(), "$.id");

        String carolToken = registerAndLogin("ws-carol@example.com", "Carol Vega");

        mockMvc.perform(get("/api/v1/workspaces/{id}/members", workspaceId)
                        .header("Authorization", "Bearer " + carolToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        mockMvc.perform(get("/api/v1/workspaces/{id}/members", UUID.randomUUID())
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void shouldReturnConflictWhenSlugAlreadyUsed() throws Exception {
        String token = registerAndLogin("ws-dave@example.com", "Dave Liu");

        String body = objectMapper.writeValueAsString(Map.of("name", "Dev Team", "slug", "dev-team"));
        mockMvc.perform(post("/api/v1/workspaces")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/workspaces")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void shouldRejectInvalidWorkspaceWithProblemDetail() throws Exception {
        String token = registerAndLogin("ws-eve@example.com", "Eve Dubois");

        String body = objectMapper.writeValueAsString(Map.of(
                "name", "",
                "slug", "SLUG-MAJUSCULE"));

        mockMvc.perform(post("/api/v1/workspaces")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors").isArray());
    }
}
