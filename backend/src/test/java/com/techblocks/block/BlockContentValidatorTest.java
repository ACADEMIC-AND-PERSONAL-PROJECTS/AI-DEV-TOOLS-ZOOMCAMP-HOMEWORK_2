package com.techblocks.block;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class BlockContentValidatorTest {

    private final BlockContentValidator validator = new BlockContentValidator();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private JsonNode json(String content) throws Exception {
        return objectMapper.readTree(content);
    }

    @Test
    void shouldAcceptConformMarkdownContent() throws Exception {
        assertThatCode(() -> validator.validate(BlockType.MARKDOWN,
                json("{\"text\":\"## Intro\"}"))).doesNotThrowAnyException();
    }

    @Test
    void shouldRejectMarkdownWithoutText() throws Exception {
        assertThatThrownBy(() -> validator.validate(BlockType.MARKDOWN, json("{\"autre\":\"x\"}")))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("statusCode")
                .isEqualTo(org.springframework.http.HttpStatus.UNPROCESSABLE_ENTITY);
    }

    @Test
    void shouldAcceptConformCodeContent() throws Exception {
        assertThatCode(() -> validator.validate(BlockType.CODE,
                json("{\"language\":\"typescript\",\"code\":\"const x = 1;\",\"showLineNumbers\":true,\"fileName\":\"greet.ts\"}")))
                .doesNotThrowAnyException();
    }

    @Test
    void shouldRejectCodeWithoutLanguage() throws Exception {
        assertThatThrownBy(() -> validator.validate(BlockType.CODE,
                json("{\"code\":\"const x = 1;\"}")))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void shouldRejectCodeWithInvalidShowLineNumbers() throws Exception {
        assertThatThrownBy(() -> validator.validate(BlockType.CODE,
                json("{\"language\":\"java\",\"code\":\"x\",\"showLineNumbers\":\"oui\"}")))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void shouldAcceptConformMermaidContent() throws Exception {
        assertThatCode(() -> validator.validate(BlockType.MERMAID,
                json("{\"code\":\"graph TD; A-->B;\"}"))).doesNotThrowAnyException();
    }

    @Test
    void shouldAcceptConformApiEndpointContent() throws Exception {
        assertThatCode(() -> validator.validate(BlockType.API_ENDPOINT, json("""
                {"method":"POST","endpoint":"/api/v1/auth/login","summary":"Login",
                 "headers":[{"key":"Content-Type","value":"application/json"}],
                 "requestBody":"{}","responseExample":"{}"}
                """))).doesNotThrowAnyException();
    }

    @Test
    void shouldRejectApiEndpointWithoutSummary() throws Exception {
        assertThatThrownBy(() -> validator.validate(BlockType.API_ENDPOINT,
                json("{\"method\":\"POST\",\"endpoint\":\"/x\"}")))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void shouldRejectApiEndpointWithMalformedHeaders() throws Exception {
        assertThatThrownBy(() -> validator.validate(BlockType.API_ENDPOINT,
                json("{\"method\":\"POST\",\"endpoint\":\"/x\",\"summary\":\"s\",\"headers\":[{\"key\":1}]}")))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void shouldAcceptConformCalloutContent() throws Exception {
        assertThatCode(() -> validator.validate(BlockType.CALLOUT,
                json("{\"variant\":\"WARNING\",\"title\":\"Attention\",\"message\":\"Rate limit\"}")))
                .doesNotThrowAnyException();
    }

    @Test
    void shouldRejectCalloutWithUnknownVariant() throws Exception {
        assertThatThrownBy(() -> validator.validate(BlockType.CALLOUT,
                json("{\"variant\":\"BOGUS\",\"title\":\"t\",\"message\":\"m\"}")))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void shouldRejectCalloutWithoutMessage() throws Exception {
        assertThatThrownBy(() -> validator.validate(BlockType.CALLOUT,
                json("{\"variant\":\"INFO\",\"title\":\"t\"}")))
                .isInstanceOf(ResponseStatusException.class);
    }
}
