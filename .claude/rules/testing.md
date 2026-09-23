# Testing — TechBlocks

## Backend (JUnit 5 + Mockito)

- Tests unitaires de services : mocks Mockito, un comportement par test.
- `@WebMvcTest` pour les controllers (slices), `@DataJpaTest` pour les repositories, Testcontainers pour l'intégration PostgreSQL réelle.
- Nommage : `should<Attendu>When<Contexte>` (ex. `shouldReturnForbiddenWhenUserNotMember`).
- Tester les cas d'erreur (401/403/404/409/422) autant que le happy path.

## Frontend (Vitest + React Testing Library)

- Tests de composants orientés comportement (rôle/texte, pas d'implémentation interne).
- msw pour mocker les appels API.
- Couvrir au minimum : le rendu des 5 types de blocs, le slash menu, le hook `useAutosave` (debounce + PUT batch).

## Règles générales

- **Jamais modifier un test pour faire passer le code.** La cause racine est dans le code.
- Toute la suite doit passer avant commit : `./mvnw test` (backend) et `npm run test` (frontend).
- Un correctif de bug inclut un test de régression.
- Chaque étape livrée est accompagnée de ses tests, dans le même commit.