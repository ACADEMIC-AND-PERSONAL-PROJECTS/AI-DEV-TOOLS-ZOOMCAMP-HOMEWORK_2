package com.techblocks.workspace;

import com.techblocks.auth.User;
import com.techblocks.auth.UserRepository;
import com.techblocks.workspace.dto.CreateWorkspaceRequest;
import com.techblocks.workspace.dto.MemberResponse;
import com.techblocks.workspace.dto.WorkspaceResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<WorkspaceResponse> listForUser(UUID userId) {
        return workspaceRepository.findByMemberUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public WorkspaceResponse create(UUID userId, CreateWorkspaceRequest request) {
        String slug = resolveSlug(request);
        if (workspaceRepository.existsBySlug(slug)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce slug de workspace existe déjà");
        }
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));
        Workspace workspace = workspaceRepository.save(
                Workspace.builder().name(request.name().trim()).slug(slug).owner(owner).build());
        memberRepository.save(WorkspaceMember.builder()
                .workspace(workspace)
                .user(owner)
                .role(Role.ADMIN)
                .build());
        return toResponse(workspace);
    }

    @Transactional(readOnly = true)
    public List<MemberResponse> listMembers(UUID workspaceId, UUID requesterId) {
        if (!workspaceRepository.existsById(workspaceId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Workspace introuvable");
        }
        if (memberRepository.findByWorkspaceIdAndUserId(workspaceId, requesterId).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'êtes pas membre de ce workspace");
        }
        return memberRepository.findByWorkspaceId(workspaceId).stream()
                .map(this::toMemberResponse)
                .toList();
    }

    private String resolveSlug(CreateWorkspaceRequest request) {
        if (request.slug() != null && !request.slug().isBlank()) {
            return request.slug().trim();
        }
        String normalized = Normalizer.normalize(request.name(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
        return normalized.isBlank() ? "workspace" : normalized;
    }

    private WorkspaceResponse toResponse(Workspace workspace) {
        return new WorkspaceResponse(workspace.getId(), workspace.getName(), workspace.getSlug(),
                workspace.getOwner().getId(), workspace.getCreatedAt());
    }

    private MemberResponse toMemberResponse(WorkspaceMember member) {
        User user = member.getUser();
        return new MemberResponse(member.getId(), user.getId(), user.getEmail(), user.getFullName(),
                user.getAvatarUrl(), member.getRole().name(), member.getJoinedAt());
    }
}
