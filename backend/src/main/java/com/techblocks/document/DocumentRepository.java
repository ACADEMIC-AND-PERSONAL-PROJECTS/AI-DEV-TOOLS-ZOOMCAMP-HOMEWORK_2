package com.techblocks.document;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID> {

    List<Document> findByWorkspaceIdOrderByPositionAsc(UUID workspaceId);

    @Query("""
            select coalesce(max(d.position), -1) from Document d
            where d.workspace.id = :workspaceId
              and ((:parentId is null and d.parent is null) or d.parent.id = :parentId)
            """)
    int findMaxSiblingPosition(@Param("workspaceId") UUID workspaceId, @Param("parentId") UUID parentId);
}
