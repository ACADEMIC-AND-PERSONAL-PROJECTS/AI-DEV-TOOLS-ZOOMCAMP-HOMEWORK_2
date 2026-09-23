package com.techblocks.workspace;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface WorkspaceRepository extends JpaRepository<Workspace, UUID> {

    boolean existsBySlug(String slug);

    @Query("select w from Workspace w join WorkspaceMember m on m.workspace = w where m.user.id = :userId order by w.createdAt desc")
    List<Workspace> findByMemberUserId(@Param("userId") UUID userId);
}
