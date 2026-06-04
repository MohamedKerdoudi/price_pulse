# PricePulse - Smart Price Tracker

Une application web permettant de suivre l'évolution du prix d'un produit e-commerce et de visualiser ces informations sur un tableau de bord interactif.

---

## Stack Technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 19 + Vite + TypeScript |
| Backend | Node.js + Express + TypeScript |
| Base de données | PostgreSQL 16 |
| State Management | TanStack Query (React Query) |
| Validation | Zod |
| Tests | Jest + Supertest |
| Conteneurisation | Docker + docker-compose |

---

## Architecture

```
pricepulse/
├── backend/
│   ├── src/
│   │   ├── config/        # Connexion DB, migrations
│   │   ├── controllers/   # Logique métier des endpoints
│   │   ├── middleware/     # Error handler, validation
│   │   ├── routes/        # Définitions de routes
│   │   ├── services/      # Validation, simulateur de prix
│   │   └── types/         # Types TypeScript
│   └── tests/
│       ├── unit/          # Tests unitaires (validation)
│       └── integration/   # Tests d'intégration (API + DB)
├── frontend/
│   └── src/
│       ├── api/           # Client HTTP (axios)
│       ├── components/    # Composants React
│       ├── hooks/         # Hooks personnalisés (TanStack Query)
│       └── types/         # Types partagés
├── docker-compose.yml
└── init.sql               # Schéma SQL
```

### Choix d'architecture

- **Monorepo simple** : Backend et frontend dans un même dépôt pour simplifier le développement et le déploiement. Pas de workspace manager complexe — chaque dossier a son propre `package.json`.

- **TanStack Query (React Query)** : Gestion d'état asynchrone sans boilerplate. Les données sont automatiquement mises en cache, rafraîchies en arrière-plan, et les états de chargement/erreur sont gérés nativement. Le dashboard se met à jour sans intervention utilisateur.

- **Zod pour la validation** : Les schémas de validation côté serveur sont déclaratifs, typés (TypeScript), et produisent des messages d'erreur explicites. Une seule source de vérité pour la validation des entrées.

- **Simulateur de prix** : Un worker en arrière-plan (`setInterval` toutes les 30 secondes) fait varier les prix de +/-5% aléatoirement. Cela permet de démontrer les indicateurs de tendance (hausse/baisse/stable) sans avoir besoin d'un vrai site e-commerce.

- **PostgreSQL** : Choix d'une base relationnelle robuste avec :
  - UUID comme primary keys (évite l'exposition d'IDs séquentiels)
  - Timestamps avec timezone (`TIMESTAMPTZ`)
  - Index sur les colonnes de recherche fréquentes (`product_id`, `recorded_at`)
  - Contrainte `ON DELETE CASCADE` entre `products` et `price_history`

- **Docker Compose** : L'ensemble de l'application (frontend, backend, PostgreSQL) se lance avec une seule commande. Pas besoin d'installer Node.js, PostgreSQL, ou autre outil localement.

---

## Démarrage Rapide (Recommandé)

### Prérequis

- [Docker](https://docs.docker.com/get-docker/) installé
- [Docker Compose](https://docs.docker.com/compose/install/) (inclus avec Docker Desktop)

### Lancer l'application

```bash
docker-compose up --build
```

Cette commande :
1. Construit les images Docker du backend et du frontend
2. Démarre une instance PostgreSQL 16
3. Exécute les migrations automatiquement
4. Lance le simulateur de prix en arrière-plan

L'application sera accessible sur :
| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **API REST** | http://localhost:3001/api |
| **Healthcheck** | http://localhost:3001/api/health |

### Arrêter l'application

```bash
docker-compose down
```

Pour supprimer aussi les données de la base (volume) :

```bash
docker-compose down -v
```

---

## Développement Local (sans Docker)

### 1. Base de données

```bash
docker run -d --name pricepulse-db \
  -e POSTGRES_DB=pricepulse \
  -e POSTGRES_USER=pricepulse \
  -e POSTGRES_PASSWORD=pricepulse \
  -p 5432:5432 \
  postgres:16-alpine
```

### 2. Backend

```bash
cd backend
npm install
npm run migration:run
npm run dev
```

Le serveur backend démarre sur `http://localhost:3001`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Le serveur de développement frontend démarre sur `http://localhost:5173`.

---

## API REST

### Endpoints

| Méthode | URL | Description |
|---------|-----|-------------|
| `GET` | `/api/health` | Healthcheck de l'API |
| `GET` | `/api/products` | Liste des produits (paginnée) |
| `POST` | `/api/products` | Ajouter un produit |
| `GET` | `/api/products/:id` | Détail d'un produit |
| `DELETE` | `/api/products/:id` | Supprimer un produit |
| `GET` | `/api/products/:id/history` | Historique des prix |

### Pagination

```
GET /api/products?page=1&limit=20
```

### Exemple : Ajouter un produit

```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/product/123",
    "name": "Mon Produit",
    "price": 29.99
  }'
```

Réponse (201) :
```json
{
  "id": "uuid",
  "url": "https://example.com/product/123",
  "name": "Mon Produit",
  "initialPrice": 29.99,
  "currentPrice": 29.99,
  "currency": "EUR",
  "priceChange": 0,
  "priceChangePercent": 0,
  "trend": "stable",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### Codes d'erreur

| Status | Code | Description |
|--------|------|-------------|
| 400 | `VALIDATION_ERROR` | Données invalides (Zod) |
| 404 | `NOT_FOUND` | Ressource introuvable |
| 500 | `INTERNAL_ERROR` | Erreur serveur inattendue |

---

## Collection Postman

Une collection Postman est disponible à la racine du projet : [`PricePulse.postman_collection.json`](./PricePulse.postman_collection.json).

### Importer la collection dans Postman

1. Ouvrir **Postman**
2. Cliquer sur **Import** (ou `Ctrl+O`)
3. Sélectionner le fichier `PricePulse.postman_collection.json` à la racine du projet
4. La collection **PricePulse** apparaît dans vos collections

### Tester les endpoints

La collection contient les requêtes pré-configurées pour tous les endpoints de l'API :

| Requête | Méthode | URL | Description |
|---------|---------|-----|-------------|
| **Health Check** | `GET` | `{{BASE_URL}}/api/health` | Vérifier que l'API fonctionne |
| **List Products** | `GET` | `{{BASE_URL}}/api/products` | Récupérer tous les produits |
| **Add Product** | `POST` | `{{BASE_URL}}/api/products` | Ajouter un nouveau produit |
| **Get Product** | `GET` | `{{BASE_URL}}/api/products/:id` | Détail d'un produit |
| **Delete Product** | `DELETE` | `{{BASE_URL}}/api/products/:id` | Supprimer un produit |
| **Price History** | `GET` | `{{BASE_URL}}/api/products/:id/history` | Historique des prix |

La variable d'environnement `{{BASE_URL}}` est pré-configurée sur `http://localhost:5173/api` (via le proxy nginx Docker) ou `http://localhost:3001/api` (en local sans Docker). Vous pouvez définir la variable dans l'onglet **Environnement** de Postman.

### Tester sans Postman (curl)

```bash
# Health Check
curl http://localhost:5173/api/health

# Liste des produits
curl http://localhost:5173/api/products

# Ajouter un produit
curl -X POST http://localhost:5173/api/products \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/product/123","name":"Test","price":29.99}'

# Supprimer un produit (remplacer {id} par l'UUID)
curl -X DELETE http://localhost:5173/api/products/{id}
```

---

## Tests Automatisés

### Lancer tous les tests

```bash
# Depuis la racine du projet, exécuter les tests backend
cd backend
npm test
```

Cette commande lance l'ensemble des tests dans cet ordre :
1. **Tests unitaires** — Validation des schémas Zod, logique métier
2. **Tests d'intégration** — API + base de données PostgreSQL

### Lancer un type de test spécifique

```bash
# Tests unitaires uniquement
npm run test:unit

# Tests d'intégration (nécessite une instance PostgreSQL)
npm run test:integration
```

> **Note** : Les tests d'intégration nécessitent une base PostgreSQL en cours d'exécution. En environnement Docker, la base est automatiquement disponible.

---

## Schéma de la base de données

```sql
-- Table products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url VARCHAR(2048) NOT NULL,
    name VARCHAR(255) NOT NULL,
    initial_price DECIMAL(10, 2) NOT NULL,
    current_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index sur la date de création pour le tri
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Table price_history
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    price DECIMAL(10, 2) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les requêtes d'historique
CREATE INDEX idx_price_history_product_id ON price_history(product_id);
CREATE INDEX idx_price_history_recorded_at ON price_history(recorded_at DESC);
```

---

## Fonctionnalités

- **Ajout de produit** : Formulaire avec validation côté client (Zod) et côté serveur
- **Dashboard temps réel** : Liste des produits avec :
  - Prix initial et prix actuel
  - Indicateur de tendance visuel (🟢 baisse, 🔴 hausse, ⚪ stable)
  - Variation en pourcentage
- **Simulation automatique** : Les prix varient aléatoirement toutes les 30 secondes
- **Auto-refresh** : Le dashboard se met à jour automatiquement grâce à TanStack Query (refetch toutes les 30s)
- **Historique des prix** : Graphique d'évolution pour chaque produit
- **Pagination** : API paginée avec limite configurable
- **Tests automatisés** : Unitaires (Jest) + Intégration (Supertest)

---

## Si j'avais eu 2 semaines de plus

### Fonctionnalités

- **Authentification et comptes utilisateurs** : Système complet avec JWT, inscriptions, sessions, et produits privés par utilisateur. Chaque utilisateur aurait son propre dashboard personnalisé.

- **Web scraping réel** : Intégration avec Puppeteer/Cheerio pour scraper les prix depuis de vrais sites e-commerce (Amazon, eBay, etc.) — au lieu du simulateur aléatoire actuel.

- **Notifications temps réel** : Alertes par email (Nodemailer) ou push (WebSocket/SSE) lorsqu'un prix atteint un seuil défini par l'utilisateur (ex : "M'alerter si ce produit passe sous 50€").

- **Graphiques d'évolution avancés** : Visualisation avec Recharts/Chart.js :
  - Courbe d'évolution sur 7/30/90 jours
  - Comparaison entre plusieurs produits
  - Prix moyen, minimum, maximum sur une période

- **Export de données** : Export CSV et PDF des historiques de prix pour analyse externe.

- **Mode sombre** : Thème dark complet avec Tailwind CSS et persistance du choix utilisateur.

- **Multi-devises** : Support de plusieurs devises avec taux de change en temps réel (API externe).

- **Recherche et filtres** : Barre de recherche avec autocomplétion, filtres par tendance (hausse/baisse/stable), tri par prix ou date.

### Technique

- **CI/CD avec GitHub Actions** :
  - Lint + TypeScript check sur chaque PR
  - Tests unitaires et d'intégration automatiques
  - Build et déploiement automatique sur Vercel (frontend) + Railway/Render (backend)

- **Rate limiting** : Protection avec `express-rate-limit` pour éviter les abus sur l'API.

- **Logging structuré** : Winston ou Pino avec niveaux de log (debug, info, warn, error), rotation des fichiers, et format JSON pour l'intégration avec des outils de monitoring.

- **Monitoring et métriques** :
  - Healthcheck avancé avec dépendances (DB, uptime)
  - Métriques Prometheus (latence des endpoints, nombre de requêtes, erreurs)
  - Tableau de bord Grafana pour la visualisation

- **Cache Redis** : Mise en cache des requêtes fréquentes (liste des produits, historique) pour réduire la charge sur PostgreSQL.

- **Migrations versionnées** : Système de migrations avec `node-pg-migrate` ou équivalent — chaque changement de schéma est versionné, réversible, et exécuté automatiquement au démarrage.

- **Tests de performance** : Benchmarks avec k6 ou Artillery pour valider le comportement sous charge (100, 500, 1000 requêtes simultanées).

- **API documentation interactive** : Swagger/OpenAPI avec Swagger UI — documentation auto-générée des endpoints, des schémas, et possibilité de tester les requêtes depuis le navigateur.

- **Mode offline (PWA)** : Service Worker pour un fonctionnement partiel sans connexion — les dernières données consultées restent accessibles.

- **Accessibilité** : Audit complet avec axe-core et Lighthouse, navigation au clavier, contraste des couleurs, et labels ARIA.

---

## Licence

MIT