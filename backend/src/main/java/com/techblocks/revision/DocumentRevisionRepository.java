package com.techblocks.revision;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DocumentRevisionRepository extends JpaRepository<DocumentRevision, UUID> {

    List<DocumentRevision> findByDocumentIdOrderByCreatedAtDesc(UUID documentId);
}
