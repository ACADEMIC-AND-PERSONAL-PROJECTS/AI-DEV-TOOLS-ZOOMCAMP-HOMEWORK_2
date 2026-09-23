package com.techblocks.workspace;

import com.techblocks.workspace.dto.CreateWorkspaceRequest;
import com.techblocks.workspace.dto.MemberResponse;
import com.techblocks.workspace.dto.WorkspaceResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workspaces")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @GetMapping
    public List<WorkspaceResponse> list(@AuthenticationPrincipal Jwt jwt) {
        return workspaceService.listForUser(userId(jwt));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WorkspaceResponse create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CreateWorkspaceRequest request) {
        return workspaceService.create(userId(jwt), request);
    }

    @GetMapping("/{id}/members")
    public List<MemberResponse> members(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return workspaceService.listMembers(id, userId(jwt));
    }

    private UUID userId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}
