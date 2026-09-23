# Conventions API REST — TechBlocks

- Base path : `/api/v1`, JSON uniquement, réponses en camelCase.
- Auth : JWT Bearer via un header `Authorization: Bearer <token>` sur tout endpoint sauf `POST /api/v1/auth/register` et `POST /api/v1/auth/login`.
- Erreurs : format Problem Details RFC 9457 (`ProblemDetail` Spring Boot), codes HTTP corrects — 400 (validation), 401 (non authentifié), 403 (non autorisé), 404 (inexistant), 409 (conflit), 422 (données invalides), 500 (erreur serveur).
- Pagination : query params `?page=` et `?size=`, réponse `{ "items": [...], "total": n, "page": n, "size": n }`.
- Nommage : ressources au pluriel, hiérarchie `workspaceId`/`documentId` en chemin, identifiants UUID.
- Endpoints existants (cf. section 5 des specs) : auth (`register`, `login`), workspaces (`GET/POST /api/v1/workspaces`, `GET /api/v1/workspaces/{id}/members`), documents (`GET/POST /api/v1/workspaces/{workspaceId}/documents`, `GET/PUT/DELETE /api/v1/documents/{id}`), blocs (`PUT/POST /api/v1/documents/{id}/blocks`, `DELETE /api/v1/blocks/{blockId}`), révisions (`GET/POST /api/v1/documents/{id}/revisions`).
- Validation : Bean Validation (`@Valid`, `jakarta.validation`) sur chaque DTO d'entrée ; DTOs en `record`.
- Pas de logique métier dans les controllers : délégation systématique au Service.