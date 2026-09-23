package com.techblocks.workspace;

import com.techblocks.auth.User;
import com.techblocks.auth.UserRepository;
import com.techblocks.workspace.dto.CreateWorkspaceRequest;
import com.techblocks.workspace.dto.MemberResponse;
import com.techblocks.workspace.dto.WorkspaceResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WorkspaceServiceTest {

    @Mock
    private WorkspaceRepository workspaceRepository;
    @Mock
    private WorkspaceMemberRepository memberRepository;
    @Mock
    private UserRepository userRepository;
    @InjectMocks
    private WorkspaceService workspaceService;

    private final UUID userId = UUID.randomUUID();

    private User user() {
        return User.builder().id(userId).email("alice@example.com").fullName("Alice Dupont").build();
    }

    private void stubSavedWorkspaceWithId() {
        when(workspaceRepository.save(any(Workspace.class))).thenAnswer(invocation -> {
            Workspace workspace = invocation.getArgument(0);
            workspace.setId(UUID.randomUUID());
            return workspace;
        });
    }

    @Test
    void shouldCreateWorkspaceAndAddRequesterAsAdmin() {
        when(workspaceRepository.existsBySlug("equipe-backend")).thenReturn(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user()));
        stubSavedWorkspaceWithId();

        WorkspaceResponse response = workspaceService.create(userId,
                new CreateWorkspaceRequest("Équipe Backend", null));

        assertThat(response.slug()).isEqualTo("equipe-backend");
        assertThat(response.name()).isEqualTo("Équipe Backend");
        assertThat(response.ownerId()).isEqualTo(userId);
        ArgumentCaptor<WorkspaceMember> memberCaptor = ArgumentCaptor.forClass(WorkspaceMember.class);
        verify(memberRepository).save(memberCaptor.capture());
        WorkspaceMember member = memberCaptor.getValue();
        assertThat(member.getRole()).isEqualTo(Role.ADMIN);
        assertThat(member.getUser().getId()).isEqualTo(userId);
        assertThat(member.getWorkspace().getSlug()).isEqualTo("equipe-backend");
    }

    @Test
    void shouldKeepProvidedSlugWhenPresent() {
        when(workspaceRepository.existsBySlug("dev-team")).thenReturn(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user()));
        stubSavedWorkspaceWithId();

        WorkspaceResponse response = workspaceService.create(userId,
                new CreateWorkspaceRequest("Dev Team", "dev-team"));

        assertThat(response.slug()).isEqualTo("dev-team");
    }

    @Test
    void shouldReturnConflictWhenSlugAlreadyExists() {
        when(workspaceRepository.existsBySlug("dev-team")).thenReturn(true);

        assertThatThrownBy(() -> workspaceService.create(userId, new CreateWorkspaceRequest("Dev Team", "dev-team")))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("statusCode")
                .isEqualTo(org.springframework.http.HttpStatus.CONFLICT);
    }

    @Test
    void shouldReturnUnauthorizedWhenUserUnknown() {
        when(workspaceRepository.existsBySlug("dev-team")).thenReturn(false);
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> workspaceService.create(userId, new CreateWorkspaceRequest("Dev Team", "dev-team")))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("statusCode")
                .isEqualTo(org.springframework.http.HttpStatus.UNAUTHORIZED);
    }

    @Test
    void shouldListWorkspacesWhereUserIsMember() {
        UUID workspaceId = UUID.randomUUID();
        Workspace workspace = Workspace.builder().id(workspaceId).name("Backend")
                .slug("backend").owner(user()).build();
        when(workspaceRepository.findByMemberUserId(userId)).thenReturn(List.of(workspace));

        List<WorkspaceResponse> responses = workspaceService.listForUser(userId);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).id()).isEqualTo(workspaceId);
        assertThat(responses.get(0).slug()).isEqualTo("backend");
    }

    @Test
    void shouldReturnForbiddenWhenRequesterNotMember() {
        UUID workspaceId = UUID.randomUUID();
        when(workspaceRepository.existsById(workspaceId)).thenReturn(true);
        when(memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> workspaceService.listMembers(workspaceId, userId))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("statusCode")
                .isEqualTo(org.springframework.http.HttpStatus.FORBIDDEN);
    }

    @Test
    void shouldReturnNotFoundWhenWorkspaceMissing() {
        UUID workspaceId = UUID.randomUUID();
        when(workspaceRepository.existsById(workspaceId)).thenReturn(false);

        assertThatThrownBy(() -> workspaceService.listMembers(workspaceId, userId))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("statusCode")
                .isEqualTo(org.springframework.http.HttpStatus.NOT_FOUND);
    }

    @Test
    void shouldReturnMembersWithRoleAndUserInfo() {
        UUID workspaceId = UUID.randomUUID();
        Workspace workspace = Workspace.builder().id(workspaceId).name("Backend")
                .slug("backend").owner(user()).build();
        WorkspaceMember member = WorkspaceMember.builder()
                .id(UUID.randomUUID()).workspace(workspace).user(user()).role(Role.EDITOR).build();
        when(workspaceRepository.existsById(workspaceId)).thenReturn(true);
        when(memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)).thenReturn(Optional.of(member));
        when(memberRepository.findByWorkspaceId(workspaceId)).thenReturn(List.of(member));

        List<MemberResponse> responses = workspaceService.listMembers(workspaceId, userId);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).role()).isEqualTo("EDITOR");
        assertThat(responses.get(0).email()).isEqualTo("alice@example.com");
    }
}
