package com.techblocks.document;

import com.techblocks.document.dto.CreateDocumentRequest;
import com.techblocks.document.dto.DocumentResponse;
import com.techblocks.document.dto.DocumentTreeResponse;
import com.techblocks.document.dto.UpdateDocumentRequest;
import com.techblocks.security.JwtSubjects;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping("/workspaces/{workspaceId}/documents")
    public List<DocumentTreeResponse> listTree(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID workspaceId) {
        return documentService.listTree(workspaceId, JwtSubjects.userId(jwt));
    }

    @PostMapping("/workspaces/{workspaceId}/documents")
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentResponse create(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID workspaceId,
                                   @Valid @RequestBody CreateDocumentRequest request) {
        return documentService.create(workspaceId, JwtSubjects.userId(jwt), request);
    }

    @GetMapping("/documents/{id}")
    public DocumentResponse get(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return documentService.get(id, JwtSubjects.userId(jwt));
    }

    @PutMapping("/documents/{id}")
    public DocumentResponse update(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
                                   @Valid @RequestBody UpdateDocumentRequest request) {
        return documentService.update(id, JwtSubjects.userId(jwt), request);
    }

    @DeleteMapping("/documents/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        documentService.delete(id, JwtSubjects.userId(jwt));
    }
}
