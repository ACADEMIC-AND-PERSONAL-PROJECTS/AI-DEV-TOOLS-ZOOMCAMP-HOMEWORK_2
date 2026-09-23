---
description: Lance une revue complète de l'état du dépôt TechBlocks avant commit ou livraison.
argument-hint: (optionnel) fichiers ou périmètre à cibler
---

1. **État du dépôt** : affiche `git status` et `git diff --stat` pour cadrer le périmètre.
2. **Revue de code** : délègue à `code-review` (conformité specs, conventions, qualité, tests).
3. **Revue sécurité** : délègue à `security-auditor` (injection, JWT, secrets, authz).
4. **Vérifications techniques** : lance les suites si non faites — `cd backend && ./mvnw test`, `cd frontend && npm run test`, puis lint et typecheck frontend.
5. **Découpage des commits** : contrôle que le travail est découpé en commits logiques et fréquents ; signale si un commit accumule trop de changements non liés.
6. **Rapport** : synthèse des findings (critique / amélioration / conforme) et recommandation finale (livrable ou à corriger).