# Code style — TechBlocks

## Frontend (React / TypeScript / Tailwind)

- TypeScript strict, types explicites, jamais de `any`. Définir les types partagés dans `src/types/`.
- Composants : fonctions + hooks, un composant par fichier, aucun état dans les composants de plus de quelques dizaines de lignes si un hook est plus lisible.
- UI via shadcn/ui (Radix) dans `src/components/ui/` ; styles Tailwind uniquement (pas de CSS custom sauf contrainte forte).
- Nommage : PascalCase composants, camelCase fonctions/hooks, kebab-case fichiers.
- Imports : d'abord React, puis libs, puis imports internes relatifs.
- Appels API : uniquement via `src/services/` (Axios), jamais d'`fetch` inline dans les composants.
- Les 5 blocs (`CodeBlock`, `MarkdownBlock`, `MermaidBlock`, `ApiBlock`, `CalloutBlock`) vivent dans `src/components/blocks/` et rendent des données `Block` typées.
- Échapper tout contenu utilisateur avant rendu (markdown/API) ; pas d'`innerHTML` non sanitisé.

## Backend (Java 21 / Spring Boot 3)

- Packages par feature : `auth`, `workspace`, `document`, `block`, `revision` + `config`, `security`, `common`.
- Couches strictes : Controller → Service → Repository ; aucune logique métier dans les controllers, aucun SQL dans les services.
- DTOs en `record`, Lombok (`@RequiredArgsConstructor`, `@Getter`, `@Setter`, `@Builder`) sur les entités JPA.
- Java 21 : privilégier records, `switch` expressions, pattern matching quand opportun.
- JPA avec mappings explicites ; FK et cascades identiques au schéma de la section 3 des specs.
- Nommage : méthode verbe + nom (`findById`, `createWorkspace`, `updateBlocks`), classes en PascalCase.
- Config Spring Security (stateless JWT) isolée dans `security/`.
- Aucun secret en dur : lecture via variable d'environnement (`@Value` + env var).