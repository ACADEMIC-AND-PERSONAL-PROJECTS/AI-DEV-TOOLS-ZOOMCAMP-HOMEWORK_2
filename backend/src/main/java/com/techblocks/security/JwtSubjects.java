package com.techblocks.security;

import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

public final class JwtSubjects {

    private JwtSubjects() {
    }

    public static UUID userId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}
