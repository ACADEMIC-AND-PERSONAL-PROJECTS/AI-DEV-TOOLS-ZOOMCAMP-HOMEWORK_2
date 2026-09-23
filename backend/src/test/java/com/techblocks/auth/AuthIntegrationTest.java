package com.techblocks.auth;

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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class AuthIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldRegisterAndReturnCreatedUser() throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "email", "alice@example.com",
                "password", "password123",
                "fullName", "Alice Dupont"));

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.email").value("alice@example.com"))
                .andExpect(jsonPath("$.fullName").value("Alice Dupont"));

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void shouldRejectInvalidRegistrationWithProblemDetail() throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "email", "pas-un-email",
                "password", "court",
                "fullName", ""));

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors").isArray());
    }

    @Test
    void shouldLoginAndAccessProtectedEndpoint() throws Exception {
        String registerBody = objectMapper.writeValueAsString(Map.of(
                "email", "bob@example.com",
                "password", "password123",
                "fullName", "Bob Martin"));
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isCreated());

        String loginBody = objectMapper.writeValueAsString(Map.of(
                "email", "bob@example.com",
                "password", "password123"));
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("bob@example.com"))
                .andReturn();
        String token = JsonPath.read(loginResult.getResponse().getContentAsString(), "$.token");

        mockMvc.perform(get("/api/v1/workspaces"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));

        mockMvc.perform(get("/api/v1/workspaces")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void shouldRejectLoginWithWrongPassword() throws Exception {
        String registerBody = objectMapper.writeValueAsString(Map.of(
                "email", "carol@example.com",
                "password", "password123",
                "fullName", "Carol Vega"));
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isCreated());

        String loginBody = objectMapper.writeValueAsString(Map.of(
                "email", "carol@example.com",
                "password", "mauvais-password"));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }
}
