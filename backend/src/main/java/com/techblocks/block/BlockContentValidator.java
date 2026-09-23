package com.techblocks.block;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;

@Component
public class BlockContentValidator {

    private static final Set<String> CALLOUT_VARIANTS = Set.of("INFO", "WARNING", "SUCCESS", "ERROR");

    public void validate(BlockType type, JsonNode content) {
        switch (type) {
            case MARKDOWN -> requireText(content, "text");
            case CODE -> {
                requireText(content, "language");
                requireText(content, "code");
                requireOptionalText(content, "fileName");
                requireOptionalBoolean(content, "showLineNumbers");
            }
            case MERMAID -> requireText(content, "code");
            case API_ENDPOINT -> {
                requireText(content, "method");
                requireText(content, "endpoint");
                requireText(content, "summary");
                requireOptionalText(content, "requestBody");
                requireOptionalText(content, "responseExample");
                requireOptionalHeaders(content);
            }
            case CALLOUT -> {
                requireText(content, "variant");
                requireText(content, "title");
                requireText(content, "message");
                if (!CALLOUT_VARIANTS.contains(content.get("variant").asText())) {
                    throw invalid(content, "variant doit être INFO, WARNING, SUCCESS ou ERROR");
                }
            }
        }
    }

    private void requireOptionalHeaders(JsonNode content) {
        if (!content.has("headers") || content.get("headers").isNull()) {
            return;
        }
        JsonNode headers = content.get("headers");
        if (!headers.isArray()) {
            throw invalid(content, "headers doit être un tableau");
        }
        for (JsonNode header : headers) {
            if (!header.isObject() || !header.hasNonNull("key") || !header.get("key").isTextual()
                    || !header.hasNonNull("value") || !header.get("value").isTextual()) {
                throw invalid(content, "chaque header doit contenir key et value (chaînes)");
            }
        }
    }

    private void requireOptionalText(JsonNode content, String field) {
        if (content.has(field) && !content.get(field).isNull() && !content.get(field).isTextual()) {
            throw invalid(content, "champ '" + field + "' doit être une chaîne");
        }
    }

    private void requireOptionalBoolean(JsonNode content, String field) {
        if (content.has(field) && !content.get(field).isNull() && !content.get(field).isBoolean()) {
            throw invalid(content, "champ '" + field + "' doit être un booléen");
        }
    }

    private void requireText(JsonNode content, String field) {
        if (content == null || !content.isObject() || !content.hasNonNull(field) || !content.get(field).isTextual()) {
            throw invalid(content, "champ '" + field + "' manquant ou invalide");
        }
    }

    private ResponseStatusException invalid(JsonNode content, String detail) {
        return new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Contenu de bloc invalide : " + detail);
    }
}
