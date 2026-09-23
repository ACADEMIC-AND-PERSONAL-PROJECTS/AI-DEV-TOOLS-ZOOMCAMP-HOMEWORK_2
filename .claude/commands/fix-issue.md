---
description: Corrige un bug ou un problème signalé sur TechBlocks, avec tests et commit associé.
argument-hint: description courte du problème (optionnel)
---

1. **Comprendre** : lis le problème, reproduis si possible, repère les fichiers liés (frontend `services/` + composants, backend `controllers/` + `services/` + `repositories/`).
2. **Cause racine** : localise la source du bug dans le code — ne contourne jamais un symptôme et ne modifie jamais un test pour le faire passer.
3. **Corriger** : applique le correctif minimal, conforme aux conventions du projet (cf. `_docs/specs.md` et `.claude/rules/`).
4. **Tester** : ajoute ou mets à jour un test de régression, puis lance la suite concernée (`./mvnw test` backend, `npm run test` frontend) + lint + typecheck.
5. **Commit** : message conventionnel `fix(scope): description` (ex. `fix(blocks): escapement markdown manquant`). Commit isolé au correctif.
6. **Vérifier** : si des étapes du projet suivent (étapes logiques décrites dans les specs), continue par petits commits plutôt que de tout accumuler.