# TechBlocks — AGENTS.md

Instructions partagées pour tous les agents IA (Claude Code, opencode, GitHub Copilot, Cursor, Codex) qui travaillent sur ce dépôt.

## Vue d'ensemble

**TechBlocks** est une plateforme de documentation collaborative orientée Tech & développeurs, inspirée de Linear / Notion : des documents structurés en blocs (markdown, code, diagrammes Mermaid, endpoints API, callouts).

Stack : React (Vite + TypeScript) + Tailwind CSS + shadcn/ui + Framer Motion + Monaco/CodeMirror + Mermaid.js · Spring Boot 3 (Java 21) + Spring Security (JWT) + JPA/Hibernate + Lombok · PostgreSQL 16 · Docker Compose.

## Source de vérité

`_docs/specs.md` contient le cahier des charges complet : vision UI/UX, schéma SQL, spécifications JSON des 5 blocs, endpoints REST, architecture frontend, docker-compose attendu et étapes pas-à-pas. **Consulte-le avant toute modélisation et respecte-le.**

### Layout du dépôt

```
WEEK_3/
├── _docs/specs.md          # Cahier des charges (source de vérité)
├── docker-compose.yml      # PostgreSQL 16 (db techblocks, port 5432)
├── backend/                # Spring Boot 3, Java 21
└── frontend/               # React Vite + TypeScript + Tailwind
```

## Commandes

| Action | Commande |
| --- | --- |
| Démarrer la base | `docker compose up -d` |
| Arrêter la base | `docker compose down` |
| Backend (dev) | `cd backend && ./mvnw spring-boot:run` |
| Tests backend | `cd backend && ./mvnw test` |
| Frontend (dev) | `cd frontend && npm run dev` |
| Tests frontend | `cd frontend && npm run test` |
| Lint frontend | `cd frontend && npm run lint` |
| Typecheck frontend | `cd frontend && npx tsc --noEmit` |

## Règle d'or : commits fréquents

Développe par petites étapes logiques et **commit après chaque étape terminée**. Ne jamais accumuler tout le travail pour un seul gros commit final. Exemple de découpage : infra + schéma SQL → entités Spring Boot → auth JWT → workspaces/membres → documents → blocs + autosave → révisions → frontend auth + sidebar → éditeur de blocs → historique.

- Messages de commit conventionnels : `type(scope): sujet` avec `feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `build`.
- Un commit ne doit contenir que ce qui concerne son étape logique (pas de fichiers non liés).
- Commit avant d'avancer à l'étape suivante ; en cas de régression, on corrige puis on commite le correctif.

## Conventions backend (Spring Boot 3 / Java 21)

- Packages par feature : `auth`, `workspace`, `document`, `block`, `revision` + `config`, `security`, `common`.
- Strates strictes : Controller → Service → Repository. Aucune logique métier dans les controllers, aucun SQL dans les services.
- Entités : `User`, `Workspace`, `WorkspaceMember`, `Document`, `Block`, `DocumentRevision` conformes au schéma de la section 3 des specs (UUID, `gen_random_uuid()`, relations et cascades identiques).
- DTOs en `record`, Lombok (`@RequiredArgsConstructor`, `@Getter`, `@Setter`, `@Builder`) sur les entités.
- JPA avec mappings explicites ; migrations SQL versionnées (Flyway si retenu) plutôt que génération automatique en prod.
- Validation Bean Validation (`@Valid`, `jakarta.validation`) sur tous les DTO d'entrée.

## Conventions frontend (React / TypeScript)

- TypeScript strict, types explicites, jamais de `any`.
- Structure `src/` identique à la section 6 des specs : `components/ui`, `components/layout`, `components/blocks`, `components/editor`, `components/history`, `hooks`, `services`, `types`, `pages`.
- Composants fonction + hooks ; UI via shadcn/ui (Radix) ; styles Tailwind uniquement.
- Nommage : PascalCase composants, camelCase fonctions/hooks, kebab-case fichiers.
- Appels API centralisés dans `services/` (Axios), types partagés dans `src/types/`.
- Hook `useAutosave` avec debounce 1.5s → `PUT /api/v1/documents/{id}/blocks`.

## Conventions API

- Base path `/api/v1`, JSON uniquement, responses en camelCase.
- Auth JWT Bearer sur tout sauf `/api/v1/auth/register` et `/api/v1/auth/login`.
- Erreurs en Problem Details RFC 9457 (ProblemDetail Spring Boot) avec codes HTTP corrects (400, 401, 403, 404, 409, 422, 500).
- Pagination `?page=&size=` → réponse `{ items, total, page, size }`.

## Outils MCP à disposition

Le dépôt expose des serveurs MCP via `.mcp.json` (gateway Docker MCP, profil `dev`, serveur `MCP_DOCKER_GATEWAY_DEV`). Ces outils fournissent une **documentation fraîche et à jour** des librairies ; utilise-les systématiquement avant d'implémenter une API, de résoudre un bug ou de choisir une version de dépendance de la stack :

- **Context7** (`resolve-library-id` puis `get-library-docs`) : documentation à jour de React, Spring Boot, TypeScript, Tailwind, Vite, etc. — indispensable pour corriger des erreurs basées sur d'anciennes API ou des changements de breaking changes.
- **javadocs** : documentation Javadoc des librairies Java/Spring.
- **docker-docs** : documentation officielle Docker/Compose.
- **cloudflare-docs** et **aws-documentation** : docs plateformes (si un déploiement est envisagé).

Ne t'appuie jamais sur de la connaissance figée des librairies : si un doute surgit sur une API, une config ou un versionning, consulte Context7/javadocs plutôt que de deviner. Une bonne raison d'appeler ces outils : erreur de compilation/runtime inconnue, API Spring Security/JPA douteuse, API React douteuse, config Tailwind/shadcn.

## Sécurité

- Mots de passe hachés (BCrypt), jamais en clair ni en base.
- JWT signé et configuré côté Spring Security (stateless) ; expiration + secret en env var.
- CORS restreint à l'origine frontend (vitesse de dev : `http://localhost:5173`).
- Les 5 blocs sont rendus côté client avec échappement des contenus utilisateur (pas d'`innerHTML` brut pour le markdown/API sans sanitisation).
- Aucun secret, token ou mot de passe commité.

## Tests

- Backend : JUnit 5 + Mockito, `@WebMvcTest` pour les controllers, `@DataJpaTest` pour les repositories, Testcontainers pour l'intégration PostgreSQL.
- Frontend : Vitest + React Testing Library, msw pour mocker l'API.
- **Jamais modifier un test pour faire passer le code.** La cause racine est dans le code.
- Toute la suite doit passer avant commit : `./mvnw test` + `npm run test`.

## Définition de done

1. Fonctionnalité conforme aux specs (`_docs/specs.md`).
2. Tests qui couvrent le comportement, toute la suite verte.
3. Lint + typecheck sans erreur.
4. Commit conventionnel isolé à l'étape (message clair, aucun fichier non lié).