package com.techblocks.revision;

import com.techblocks.revision.dto.RevisionResponse;
import com.techblocks.security.JwtSubjects;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class RevisionController {

    private final RevisionService revisionService;

    @GetMapping("/documents/{id}/revisions")
    public List<RevisionResponse> list(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return revisionService.list(id, JwtSubjects.userId(jwt));
    }

    @PostMapping("/documents/{id}/revisions")
    @ResponseStatus(HttpStatus.CREATED)
    public RevisionResponse create(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return revisionService.create(id, JwtSubjects.userId(jwt));
    }
}
