package com.techblocks.block;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface BlockRepository extends JpaRepository<Block, UUID> {

    List<Block> findByDocumentIdOrderByPositionAsc(UUID documentId);

    @Query("select coalesce(max(b.position), -1) from Block b where b.document.id = :documentId")
    int findMaxPosition(@Param("documentId") UUID documentId);
}
