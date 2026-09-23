package com.techblocks.workspace.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateWorkspaceRequest(
        @NotBlank @Size(max = 100) String name,
        @Size(max = 100) @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "slug invalide (minuscules, chiffres, tirets)") String slug) {
}
