---
description: Boucle de développement itérative TechBlocks — implémente une étape en petites sous-tâches avec commits fréquents, tests et lint à chaque palier. À utiliser pour tout développement de feature.
when_to_use: Toute implémentation d'une feature ou étape des specs TechBlocks ; affirme aussi explicitement la règle des commits fréquents.
---

# Dev Loop — TechBlocks

Objectif : développer TechBlocks par petites étapes logiques avec **commits fréquents**, jamais un seul gros commit final.

## Déroulé

1. **Environnement** : vérifie l'infra (`docker compose ps`), démarre si nécessaire (`docker compose up -d`).
2. **Spec** : lis la section concernée de `_docs/specs.md` (schéma SQL, bloc JSON, endpoint, étape).
3. **Découpe** : découpe l'étape courant en sous-tâches minimales (ex. pour un bloc : entité + migration → repository → service → controller → composant front).
4. **Implémente un sous-tâche** : code conforme aux conventions de `.claude/rules/` et `AGENTS.md`.
5. **Vérifie immédiatement** : tests ciblés, lint, typecheck selon la partie touchée.
6. **Commit immédiat** : message conventionnel `type(scope): sujet` (`feat`, `fix`, `refactor`, `test`, `chore`, `docs`), commit restreint à la sous-tâche.
7. **Répète** pour la sous-tâche suivante ; en cas de régression, corrige puis commite le correctif.

## Règles de commit

- `feat(block): ajout du rendu CodeBlock` ; `feat(auth): inscription et login JWT` ; `fix(document): position des blocs après suppression`.
- Un commit = une étape logique = aucun fichier hors sujet.
- Ne pas push avant plusieurs étapes validées, sauf demande explicite.

## Sortie attendue

Chaque sous-tâche terminée produit un commit ; quand l'étape entière est livrée, récapitule la liste des commits créés.