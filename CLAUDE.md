@AGENTS.md

# TechBlocks — Instructions Claude Code

## Contexte

Tu codes **TechBlocks**, une plateforme de documentation collaborative orientée développeurs (style Linear / Notion). Le cahier des charges vit dans `_docs/specs.md` : schema SQL, specs des 5 blocs, endpoints REST, étapes de build. **Lis `_docs/specs.md` avant de modéliser la moindre entité, table, endpoint ou composant**, et reste conforme à ce document.

## Commandes projet

- Infra : `docker compose up -d` pour démarrer PostgreSQL 16, `docker compose down` pour l'arrêter.
- Backend : `cd backend && ./mvnw spring-boot:run`, tests `./mvnw test`.
- Frontend : `cd frontend && npm run dev` (sur http://localhost:5173), tests `npm run test`, lint `npm run lint`, typecheck `npx tsc --noEmit`.
- Vérification avant toute livraison : tests backend + frontend, puis typecheck.

## Règles de fer

- **Commits fréquents, jamais de commit final unique.** Découpe le travail en étapes logiques (infra + DB, chaque entité/service/controller, chaque bloc front, autosave, historique…) et **commit après chaque étape** avec un message conventionnel `type(scope): sujet`. N'attends jamais la toute fin pour tout commiter d'un coup.
- Layout du dépôt : `backend/` (Spring Boot), `frontend/` (React Vite), `docker-compose.yml` à la racine.
- Secrets et identifiants en variables d'environnement, jamais en dur dans le code.
- Ne modifie jamais un test pour faire passer du code : cherche la cause racine dans le code.
- Après chaque changement significatif : tests + lint + typecheck, puis commit.
- Reset uniquement la partie impactée dans le contexte avant un nouveau sous-tâche si l'historique devient trop long.

## Rappels spécifiques à TechBlocks

- Le serveur MCP `MCP_DOCKER_GATEWAY_DEV` (via `.mcp.json`) met à ta disposition Context7, javadocs et docker-docs : **utilise-les pour vérifier les API/versions de la stack au lieu de deviner** — surtout sur des erreurs de compilation/runtime, Spring Security/JPA, React ou config Tailwind/shadcn.
- Le compose définit `POSTGRES_DB=techblocks` sur le port 5432.
- La table `blocks` utilise les types `MARKDOWN`, `CODE`, `MERMAID`, `API_ENDPOINT`, `CALLOUT` avec un champ `content` JSONB strictement conforme aux exemples de la section 4 des specs.
- L'API est préfixée `/api/v1`, authentifiée par JWT Bearer, et les erreurs utilisent le format Problem Details (RFC 9457).
- Cible esthétique : thème sombre premium (`#09090b` / `#18181b`), bordures `border-zinc-800`, glassmorphism, Inter/Geist + JetBrains Mono, animations Framer Motion.