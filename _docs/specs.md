# 🚀 TechBlocks - Spécifications Techniques & Cahier des Charges

**Projet :** Plateforme de documentation collaborative orientée Tech & Développeurs  
**Stack :** React + Spring Boot 3 + PostgreSQL + Docker  
**Cible IA / Context :** Vibe Coding & Sprint Zoomcamp  

---

## 1. Vision & Directives UI/UX

### 1.1 Aesthetic & Direction Artistique
- **Style :** Premium Tech, inspiré de *Linear.app*, *Raycast*, *Vercel*.
- **Thème :** Dark Mode par défaut avec contrastes profonds (`#09090b` / `#18181b`), bordures fines lumineuses (`border-zinc-800`), effets de flou/glassmorphism et typographies soignées.
- **Police :** Sans-serif moderne (`Inter` ou `Geist`) pour le texte, et `JetBrains Mono` ou `Fira Code` pour tous les espaces de code.
- **Transitions :** Animations fluides avec Framer Motion (apparitions, glissement des blocs, drag & drop).

---

## 2. Architecture Technique & Tech Stack

```
+-----------------------------------------------------------------------+
|                              FRONTEND                                 |
|   React (Vite + TypeScript) + Tailwind CSS + shadcn/ui + Lucide Icons |
|   Framer Motion + Monaco Editor / CodeMirror + Mermaid.js             |
+-----------------------------------------------------------------------+
                                   | REST (JSON) + JWT
+-----------------------------------------------------------------------+
|                              BACKEND                                  |
|   Spring Boot 3 (Java 21) + Spring Security + JPA / Hibernate         |
|   Lombok + Flyway / Liquibase (optionnel)                             |
+-----------------------------------------------------------------------+
                                   | JDBC
+-----------------------------------------------------------------------+
|                            BASE DE DONNÉES                            |
|   PostgreSQL 16                                                       |
+-----------------------------------------------------------------------+
```

---

## 3. Modélisation de la Base de Données (PostgreSQL)

```sql
-- Utilisateurs
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Workspaces
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Membres des Workspaces
CREATE TABLE workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'EDITOR', 'VIEWER')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workspace_id, user_id)
);

-- Documents (Structure Arborescente)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'Document sans titre',
    icon VARCHAR(50) DEFAULT '📄',
    position INT NOT NULL DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Blocs du Document
CREATE TABLE blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (type IN ('MARKDOWN', 'CODE', 'MERMAID', 'API_ENDPOINT', 'CALLOUT')),
    content JSONB NOT NULL,
    position INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Snapshots / Historique des Révisions
CREATE TABLE document_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    snapshot_json JSONB NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Spécifications des Blocs Tech

Chaque bloc est représenté sous forme de JSON dans le champ `content` de la table `blocks` :

### 1. `CODE`
```json
{
  "language": "typescript",
  "code": "const greet = (name: string) => `Hello, ${name}`;",
  "showLineNumbers": true,
  "fileName": "utils/greet.ts"
}
```

### 2. `MARKDOWN`
```json
{
  "text": "## Introduction\nVoici la documentation de l'architecture backend..."
}
```

### 3. `MERMAID`
```json
{
  "code": "graph TD;\n  A[Client] -->|REST| B(Spring Boot);\n  B -->|JPA| C[(PostgreSQL)];"
}
```

### 4. `API_ENDPOINT`
```json
{
  "method": "POST",
  "endpoint": "/api/v1/auth/login",
  "summary": "Authentification de l'utilisateur",
  "headers": [
    {"key": "Content-Type", "value": "application/json"}
  ],
  "requestBody": "{\n  \"email\": \"user@tech.com\",\n  \"password\": \"secret\"\n}",
  "responseExample": "{\n  \"token\": \"eyJhbGciOi...\"\n}"
}
```

### 5. `CALLOUT`
```json
{
  "variant": "WARNING", // INFO, WARNING, SUCCESS, ERROR
  "title": "Attention au Rate Limiting",
  "message": "Ne pas dépasser 100 requêtes/min par clé API."
}
```

---

## 5. API REST (Endpoints Spring Boot)

### Auth
- `POST /api/v1/auth/register` - Création de compte.
- `POST /api/v1/auth/login` - Connexion et émission JWT.

### Workspaces
- `GET /api/v1/workspaces` - Liste des workspaces de l'utilisateur.
- `POST /api/v1/workspaces` - Création d'un workspace.
- `GET /api/v1/workspaces/{id}/members` - Liste des membres.

### Documents
- `GET /api/v1/workspaces/{workspaceId}/documents` - Arborescence des documents.
- `POST /api/v1/workspaces/{workspaceId}/documents` - Créer un document.
- `GET /api/v1/documents/{id}` - Obtenir un document et ses blocs.
- `PUT /api/v1/documents/{id}` - Mettre à jour les métadonnées (titre, icône).
- `DELETE /api/v1/documents/{id}` - Supprimer un document.

### Blocs & Autosave
- `PUT /api/v1/documents/{id}/blocks` - Mise à jour globale / réordonnancement des blocs (batch autosave).
- `POST /api/v1/documents/{id}/blocks` - Ajouter un bloc spécifique.
- `DELETE /api/v1/blocks/{blockId}` - Supprimer un bloc.

### Révisions
- `GET /api/v1/documents/{id}/revisions` - Liste de l'historique des snapshots.
- `POST /api/v1/documents/{id}/revisions` - Sauvegarder un snapshot manuellement/automatiquement.

---

## 6. Architecture Frontend (React)

```
src/
├── assets/
├── components/
│   ├── ui/               # Composants Radix / shadcn (Button, Dialog, Dropdown, etc.)
│   ├── layout/           # Sidebar, Navbar, WorkspaceSwitcher
│   ├── blocks/           # Composants par type de bloc
│   │   ├── CodeBlock.tsx
│   │   ├── MarkdownBlock.tsx
│   │   ├── MermaidBlock.tsx
│   │   ├── ApiBlock.tsx
│   │   └── CalloutBlock.tsx
│   ├── editor/           # Canvas d'édition, toolbar, drag & drop wrapper
│   └── history/          # Drawer d'historique des révisions
├── hooks/                # useAutosave, useDocument, useAuth
├── services/             # Axios API calls
├── types/                # Types TypeScript (Document, Block, User, Workspace)
└── pages/                # AuthPage, DashboardPage, EditorPage
```

---

## 7. Configuration Docker Compose (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: techblocks-db
    environment:
      POSTGRES_DB: techblocks
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgrespassword
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

---

## 8. Instructions Pas-à-Pas pour l'Agent IA

1. **Étape 1 : Database & Docker**
   - Lancer le container PostgreSQL via Docker Compose.
   - Créer le schéma de base de données SQL.

2. **Étape 2 : Core Spring Boot**
   - Configurer Spring Boot 3 avec Java 21, JPA, PostgreSQL driver, Lombok, et Security JWT.
   - Implémenter les Entités (`User`, `Workspace`, `Document`, `Block`, `DocumentRevision`).
   - Créer les DTOs, Repositories, Services, et Controllers.

3. **Étape 3 : Frontend Base & Auth**
   - Initialiser React avec Vite + TypeScript + Tailwind CSS + shadcn/ui.
   - Configurer le système de route et la gestion du token JWT.
   - Créer la Sidebar rétractable pour naviguer dans les documents d'un workspace.

4. **Étape 4 : Éditeur de Blocs Tech**
   - Implémenter le Canvas de blocs interactif.
   - Développer les 5 composants de blocs (`CodeBlock`, `MarkdownBlock`, `MermaidBlock`, `ApiBlock`, `CalloutBlock`).
   - Ajouter la possibilité d'insérer un bloc via un menu d'action rapide `/` (Slash menu).

5. **Étape 5 : Autosave & Historique**
   - Créer un hook `useAutosave` avec de-bounce (1.5s) qui envoie les blocs modifiés via `PUT /api/v1/documents/{id}/blocks`.
   - Activer la vue historique pour comparer ou restaurer des révisions.