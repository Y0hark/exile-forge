# ExileForge - Documentation Complète

**Projet:** ExileForge - AI-Powered Path of Exile 2 Build Generator  
**Date:** Janvier 2026  
**Status:** MVP → Community → Monetization (Phase 1 focus)  
**Stack:** Vue3/Vite (Frontend) + Node.js (Backend) + PostgreSQL + Docker

---

## TABLE DES MATIÈRES

1. [Vision & Scope](#vision--scope)
2. [Architecture Système](#architecture-système)
3. [Design System - Eternal Empire](#design-system---eternal-empire)
4. [Tech Stack & Infra](#tech-stack--infra)
5. [Data Models & Schema](#data-models--schema)
6. [API Endpoints](#api-endpoints)
7. [AI Integration (OpenRouter Only)](#ai-integration-openrouter-only)
8. [Prompts Optimisés Antigravity](#prompts-optimisés-antigravity)
9. [Frontend Architecture](#frontend-architecture)
10. [Deployment & Docker](#deployment--docker)

---

## VISION & SCOPE

### Objectif Principal (MVP Phase 1)

```
User Story:
"Je veux un build moine basé sur les dégats de froid axé sur le endgame"
                ↓
ExileForge IA répond avec:
- Build structure complet (skills, gems, passives)
- Leveling guide détaillé (par tranche de niveau)
- Gear recommendations (par niveau, budget aware)
- Alternative viable sans items uniques trop rares
- Explications détaillées du fonctionnement
- Respec warnings si swap requis
```

### Scope MVP Phase 1

**✅ INCLUS:**
- Generation de builds via OpenRouter AI
- Leveling guides avec Passive Path par tranche de niveau (1-24, 24-48, 48-72, 72-100)
- Gem progressions avec awareness des slots (2→3→4 links)
- Gear recommendations par niveau avec budget tiers
- Build explanations (comment ça marche, forces/faiblesses)
- User accounts & build saving
- Frontend magnifique (Eternal Empire theme)

**❌ HORS SCOPE (Phase 2+):**
- Trade API integration
- Live market prices
- YouTube video embedding
- Community features (comments, ratings)
- Monetization implementation
- Mobile app

---

## ARCHITECTURE SYSTÈME

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────┐
│                   EXILEFORGE SYSTEM                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐      ┌──────────────┐                │
│  │   FRONTEND   │      │   BACKEND    │                │
│  │  (Vue3/Vite)│      │  (Node.js)   │                │
│  ├──────────────┤      ├──────────────┤                │
│  │ • Builder UI │      │ • Auth       │                │
│  │ • Results    │      │ • Build Gen  │                │
│  │ • Leveling   │      │ • User Mgmt  │                │
│  │ • UI State   │      │ • DB Mgmt    │                │
│  └──────────────┘      └──────────────┘                │
│         │                       │                       │
│         └───────────────┬───────┘                       │
│                         │ API                           │
│                  ┌──────┴──────┐                       │
│                  │  DATABASE   │                       │
│                  │ (PostgreSQL)│                       │
│                  └─────────────┘                       │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │           OPENROUTER AI LAYER                    │  │
│  │  (Claude, Grok, Mistral for generation)         │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Microservices Architecture

```
exileforge/
├── frontend/                    # Vue3/Vite app
│   ├── src/
│   │   ├── components/         # UI components (Eternal theme)
│   │   ├── views/              # Pages
│   │   ├── stores/             # Pinia state
│   │   └── api/                # API client
│   └── vite.config.ts
│
├── backend/                    # Node.js microservices
│   ├── services/
│   │   ├── auth-service/       # User auth & accounts
│   │   ├── build-service/      # Build generation & storage
│   │   ├── ai-service/         # OpenRouter integration
│   │   └── database-service/   # PostgreSQL access
│   ├── shared/                 # Shared utilities
│   └── docker-compose.yml      # Orchestration
│
├── database/                   # Schema & migrations
│   ├── migrations/
│   ├── seed-data/
│   └── schema.sql
│
└── docs/                       # Documentation

```

---

## DESIGN SYSTEM - ETERNAL EMPIRE

### Inspiration: Aggorat (Act 3)

Aggorat = Forteresse controlée par Eternal, cultistes, ziggurat, darkstone, essence d'empire.

**Palette:**
```
Primary: #1a1a2e  (Deep Eternal Black)
Secondary: #d4af37  (Gold/Eternal accent)
Accent: #8b0000  (Blood Red - Cultist)
Danger: #ff6b6b  (Bright Red)
Success: #51cf66  (Ethereal Green)
Background: #0f0f1e  (Void Black)

Grays:
- #2d2d44 (Dark surface)
- #3a3a52 (Card bg)
- #4a4a66 (Border)
- #6a6a7e (Text secondary)
- #e0e0e0 (Text primary)
```

### Typography (Modern + Eternal)

```
Font families:
- Headings: "Cinzel" (serif, majestic) - Google Fonts
- Body: "Inter" (sans-serif, modern) - Google Fonts
- Mono: "JetBrains Mono" (code) - Google Fonts

Sizing:
- H1: 3.5rem (48px) - Bold
- H2: 2.5rem (36px) - Bold
- H3: 1.75rem (28px) - Semibold
- Body: 1rem (16px) - Regular
- Small: 0.875rem (14px) - Regular
```

### Component Style (Examples)

```
Buttons:
- Primary: Gold bg + Dark border, hover = brighter gold
- Secondary: Dark border + transparent bg
- Danger: Red bg

Cards:
- Dark bg (#2d2d44) with subtle border (#4a4a66)
- Gold accent line on left side
- Hover = slight glow effect

Inputs:
- Dark bg, gold border on focus
- Placeholder = muted gray
```

---

## TECH STACK & INFRA

### Frontend

```json
{
  "dependencies": {
    "vue": "^3.4",
    "vite": "^5.0",
    "pinia": "^2.1",
    "axios": "^1.6",
    "markdown-it": "^13.0",
    "highlight.js": "^11.9"
  },
  "devDependencies": {
    "typescript": "^5.3",
    "@vue/compiler-sfc": "^3.4",
    "tailwindcss": "^3.4",
    "postcss": "^8.4"
  }
}
```

### Backend

```json
{
  "dependencies": {
    "express": "^4.18",
    "axios": "^1.6",
    "pg": "^8.11",
    "jsonwebtoken": "^9.1",
    "bcrypt": "^5.1",
    "dotenv": "^16.3",
    "cors": "^2.8",
    "helmet": "^7.1"
  },
  "devDependencies": {
    "typescript": "^5.3",
    "ts-node": "^10.9",
    "@types/express": "^4.17"
  }
}
```

### Database

```
PostgreSQL 15+
- Users table
- Builds table
- Build_Versions (for history)
- Preferences table
```

### Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: exileforge
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://admin:${DB_PASSWORD}@postgres:5432/exileforge
      OPENROUTER_API_KEY: ${OPENROUTER_API_KEY}
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: development
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./backend/src:/app/src

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:3000
    volumes:
      - ./frontend/src:/app/src

volumes:
  postgres_data:
```

---

## DATA MODELS & SCHEMA

### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User preferences
CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  prefer_no_uniques BOOLEAN DEFAULT FALSE,
  prefer_no_rare_uniques BOOLEAN DEFAULT FALSE,
  allow_respec BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Builds table
CREATE TABLE builds (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  class VARCHAR(50) NOT NULL,
  ascendancy VARCHAR(100),
  main_skill VARCHAR(100) NOT NULL,
  playstyle_description TEXT,
  
  -- Build data (JSON)
  build_data JSONB NOT NULL,  -- Complete build structure
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_public BOOLEAN DEFAULT FALSE,
  downloads INT DEFAULT 0
);

-- Build versions (for history)
CREATE TABLE build_versions (
  id SERIAL PRIMARY KEY,
  build_id INT REFERENCES builds(id) ON DELETE CASCADE,
  version_number INT,
  build_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_builds_user_id ON builds(user_id);
CREATE INDEX idx_builds_public ON builds(is_public);
CREATE INDEX idx_build_versions_build_id ON build_versions(build_id);
```

### Build JSON Structure

```typescript
interface Build {
  id: string;
  name: string;
  class: 'Warrior' | 'Ranger' | 'Mage' | 'Duelist' | 'Witch' | 'Templar' | 'Shadow';
  ascendancy: string;
  playstyle: 'mapper' | 'bosser' | 'hybrid';
  
  // Main skill setup
  mainSkill: {
    gem: string;
    description: string;
    scalingMechanic: string;
  };
  
  // Leveling guide
  levelingGuide: {
    phases: LevelingPhase[];
    respectNeeded: boolean;
    respectPoints: string[];
  };
  
  // Gear progressions
  gearProgression: {
    starter: GearPhase;
    mid: GearPhase;
    endgame: GearPhase;
    alternatives: AlternativeGear[];
  };
  
  // Passive tree path
  passiveTreePath: {
    keystones: string[];
    byPhase: {
      phase1: PassivePhase;   // 1-24
      phase2: PassivePhase;   // 24-48
      phase3: PassivePhase;   // 48-72
      phase4: PassivePhase;   // 72-100
    };
  };
  
  // Analysis
  analysis: {
    strengths: string[];
    weaknesses: string[];
    mappingRating: number;      // 1-10
    bossingRating: number;      // 1-10
    survivalRating: number;     // 1-10
    explanation: string;
  };
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  version: number;
}

interface LevelingPhase {
  levelRange: string;              // "1-24"
  location: string;
  mainSkillSetup: GemSetup;
  secondarySkill?: GemSetup;
  passiveNodes: string[];
  gearTargets: GearTargets;
  gemSlotProgression: number;      // 2 → 3 → 4 links
  bossStrategy?: string;
  importantNotes: string[];
}

interface GemSetup {
  main: string;
  supports: string[];
  quality?: number;
}

interface GearPhase {
  mainHand?: ItemRecommendation;
  offHand?: ItemRecommendation;
  body: ItemRecommendation;
  helmet: ItemRecommendation;
  gloves: ItemRecommendation;
  boots: ItemRecommendation;
  belt: ItemRecommendation;
  amulet: ItemRecommendation;
  rings: [ItemRecommendation, ItemRecommendation];
  totalEstimatedCost: string;
  notes: string;
}

interface ItemRecommendation {
  priority: 'core' | 'important' | 'optional';
  unique?: string;
  baseName?: string;
  keyAffixes: string[];
  alternatives: string[];
  reasonWhy: string;
}

interface PassivePhase {
  nodes: string[];
  majorClusters: string[];
  lifeTarget: number;
  damageTarget: string;
}
```

---

## API ENDPOINTS

### Authentication

```
POST   /api/auth/register         # Create account
POST   /api/auth/login            # Get JWT token
POST   /api/auth/refresh          # Refresh JWT
POST   /api/auth/logout           # Invalidate token
GET    /api/auth/me               # Current user profile
```

### Builds

```
POST   /api/builds/generate        # Generate new build
GET    /api/builds/:id             # Get build by ID
PUT    /api/builds/:id             # Update build
DELETE /api/builds/:id             # Delete build
GET    /api/builds/user/:userId    # List user's builds
GET    /api/builds/public          # List public builds (browse)
POST   /api/builds/:id/publish     # Make build public
POST   /api/builds/:id/version     # Create version snapshot
GET    /api/builds/:id/versions    # Get build history
```

### User Preferences

```
GET    /api/preferences            # Get user preferences
PUT    /api/preferences            # Update preferences
```

### Example Build Generation Request

```bash
POST /api/builds/generate
Content-Type: application/json

{
  "playstyle_description": "I want a cold damage-based monk build focused on endgame mapping and boss fights",
  "class": "Duelist",  // optional, AI can choose
  "allow_uniques": true,
  "allow_respec": true,
  "preferred_ascendancy": null  // AI chooses
}
```

---

## AI INTEGRATION (OpenRouter Only)

### Model Selection Strategy

```typescript
const aiModels = {
  build_generation: 'grok-3',        // Fast, good for structures
  explanations: 'claude-3-5-sonnet', // Best quality for descriptions
  fallback: 'mistral-large-2'        // Budget option
};
```

### Cost Estimates

```
Per build generation:
- Build structure (Grok-3):     $0.01-0.02
- Explanations (Claude):        $0.03-0.05
- Leveling guide (Claude):      $0.02-0.04
- Total per build:              $0.06-0.11

Monthly (100 builds):           $6-11
Annual:                         $72-132

Monetization potential:
- Sell builds: $2-5 each → Payback at 30-50 sales
- Subscription: $5-15/month → 1-2 builds per month break-even
```

---

## PROMPTS OPTIMISÉS ANTIGRAVITY

### PROMPT 1: Build Generation (Grok-3 for structure)

```
You are an expert Path of Exile 2 build architect with deep knowledge 
of all skills, items, passive trees, and endgame content.

USER REQUEST:
${userRequest}

Generate a COMPLETE, VIABLE PoE2 build that:
1. Works from Act 1 to endgame maps/bosses/simulacrum
2. Uses ONLY real items and skills from the game
3. Provides clear progression path
4. Includes alternatives if primary gear is unavailable

RETURN AS JSON ONLY (no other text):
{
  "name": "descriptive build name",
  "class": "exact class name",
  "ascendancy": "specific ascendancy path",
  "mainSkill": {
    "gem": "skill name",
    "scalingMechanic": "how it scales (crit/DoT/hit/etc)",
    "description": "brief explanation"
  },
  "gearProgression": {
    "starter": { /* gear at level 1-24 */ },
    "mid": { /* gear at level 24-72 */ },
    "endgame": { /* gear at level 72+ */ }
  },
  "levelingGuide": {
    "phases": [
      {
        "levelRange": "1-24",
        "mainSkillSetup": { "main": "skill", "supports": ["s1", "s2"] },
        "gemSlotProgression": 2,
        "passiveNodes": ["cluster1", "cluster2"],
        "gearTargets": { "body": "look for X", "helm": "look for Y" },
        "notes": ["tip1", "tip2"]
      },
      // ... repeat for 24-48, 48-72, 72-100
    ],
    "respectNeeded": false,
    "respectPoints": []
  },
  "passiveTreePath": {
    "keystones": ["keystone1"],
    "byPhase": {
      "phase1": { "nodes": [...] },
      "phase2": { "nodes": [...] },
      "phase3": { "nodes": [...] },
      "phase4": { "nodes": [...] }
    }
  },
  "analysis": {
    "strengths": ["fast clear", "good single target"],
    "weaknesses": ["expensive gear", "requires uniques"],
    "mappingRating": 8,
    "bossingRating": 7,
    "survivalRating": 7
  }
}

IMPORTANT RULES:
- All skills/items must exist in PoE2
- Build must reach 3000+ life by maps
- Damage must scale to 100k+ DPS minimum
- Include ALWAYS viable alternatives for main items
- If build relies on rare unique, explain alternatives until found
- Gear targets must be achievable at each level
- Return ONLY the JSON above
```

### PROMPT 2: Build Explanations (Claude for narrative)

```
You are a master Path of Exile 2 build guide writer with 10+ years 
of community experience. Your guides are detailed, practical, and 
inspiring.

BUILD DATA:
${buildJSON}

Write a comprehensive BUILD EXPLANATION that covers:

1. CORE CONCEPT (2-3 paragraphs)
   - What makes this build unique
   - Main scaling mechanic
   - Why it works

2. SKILL BREAKDOWN
   - Main skill: mechanics and why chosen
   - Support gems: what each does and why they matter
   - Gem progression: how to adapt as you level

3. GEAR STRATEGY
   - Unique items: which ones matter, why
   - Rare items: what affixes to prioritize
   - Budget tiers: starter → mid → endgame path
   - Craft recommendations: what to farm/craft

4. PASSIVE TREE
   - Key clusters and why
   - Life vs damage balance
   - Keystones and synergies

5. PLAYSTYLE TIPS
   - Positioning and movement patterns
   - Defensive layers and when to use them
   - DPS rotation or spam strategy
   - Mapping vs bossing adjustments

6. ENDGAME CONTENT
   - Mapping performance (clear speed, sustainability)
   - Boss fights: which are easy, which need adjustment
   - Simulacrum suitability
   - Hard content adjustments (elemental weakness maps, etc)

7. COMMON PROBLEMS & SOLUTIONS
   - If mapping is slow: adjust X
   - If you're dying: prioritize Y
   - If gear is expensive: use alternative Z

Write in engaging, conversational tone. Include specific numbers where 
relevant. Be honest about weaknesses. Format with clear headings.

Output: Markdown text (no JSON).
```

### PROMPT 3: Leveling Guide Details (Claude)

```
You are an expert Path of Exile 2 leveling coach. Create a DETAILED 
leveling guide for this build that gets players from level 1 to 
maps efficiently and safely.

BUILD: ${buildName}
CLASS: ${playerClass}

For EACH leveling phase, provide:

## Level 1-24 (Acts 1-3)
- **Gem Setup**: Exact gems to use (main + all supports)
- **Passive Allocation**: 3-5 key nodes by cluster (don't overwhelm)
- **Gear Targets**: Specific affixes to look for in each slot
- **Gem Slot Progress**: Will you have 2-link or 3-link by end of phase?
- **Boss Strategy**: How to handle act bosses (Merveil, Nessa, etc)
- **Crucial Tips**: Survival or DPS tips specific to this phase

## Level 24-48 (Acts 4-5)
... (repeat structure)

## Level 48-72 (Acts 6-8)
... (repeat structure)

## Level 72-100 (Maps)
- Early maps (T1-T5)
- Mid maps (T6-T10)
- High maps (T11-T16)

IMPORTANT:
- Assume player has LIMITED currency early on
- Recommend 2-link early, 3-link by act 4, 4-link by maps
- Give EXACT gem names and order (main gem + support order)
- Warn about major difficulty spikes
- Suggest viable alternatives if main gem unavailable
- Be practical: leveling is different from endgame

Format: Markdown with clear headings and bullet points.
```

### PROMPT 4: Item Alternatives (Claude)

```
The build I just created recommends some items that might be expensive 
or hard to find. Suggest VIABLE ALTERNATIVES that work at each stage:

BUILD: ${buildJSON}

For EACH recommended unique item, provide:

1. WHY THIS UNIQUE IS IDEAL
   - What does it provide
   - Why it fits the build

2. VIABLE ALTERNATIVES (ranked by effectiveness):
   a. "Best free alternative" - Rare item affixes to look for
   b. "Cheap unique option" - Existing unique that provides similar
   c. "Later upgrade" - Mid-tier rare that carries you further
   d. "Endgame solution" - The ideal unique once found/crafted

3. GEAR PROGRESSION
   - Level 1-24: Use X (available immediately)
   - Level 24-48: Upgrade to Y (find early)
   - Level 48-72: Transition to Z (more currency)
   - Level 72+: Goal is ideal unique

EXAMPLE FORMAT:
**Main Hand - Ideal: Void Beacon**
- Provides: +2 fire gems, critical chance
- Why: Enables skill scaling early

Alternative progression:
1. FREE: Rare staff with +1 gems and spell damage
2. CHEAP: Storm Shard unique (costs 1c)
3. MID: Infernal Blow unique (3-5c)
4. GOAL: Void Beacon (10-20c)

Availability by level:
- Lv 1-24: Use rare staff with +1
- Lv 24-48: Upgrade to Storm Shard
- Lv 48+: Hunt for Void Beacon

Output: Markdown with clear progressions.
```

---

## FRONTEND ARCHITECTURE

### Folder Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Navbar.vue
│   │   │   ├── Sidebar.vue
│   │   │   └── Footer.vue
│   │   ├── Builder/
│   │   │   ├── BuilderForm.vue
│   │   │   ├── PresetOptions.vue
│   │   │   └── CustomInput.vue
│   │   ├── Results/
│   │   │   ├── BuildCard.vue
│   │   │   ├── LevelingGuide.vue
│   │   │   ├── GearProgression.vue
│   │   │   ├── PassiveTreePath.vue
│   │   │   └── BuildAnalysis.vue
│   │   └── Common/
│   │       ├── LoadingSpinner.vue
│   │       ├── ErrorAlert.vue
│   │       └── MarkdownRenderer.vue
│   │
│   ├── views/
│   │   ├── Home.vue
│   │   ├── Builder.vue
│   │   ├── MyBuilds.vue
│   │   ├── Build.vue              # View specific build
│   │   ├── Browse.vue             # Browse public builds
│   │   ├── Account.vue
│   │   └── NotFound.vue
│   │
│   ├── stores/
│   │   ├── auth.ts
│   │   ├── builds.ts
│   │   ├── ui.ts
│   │   └── preferences.ts
│   │
│   ├── api/
│   │   ├── client.ts              # Axios instance
│   │   ├── auth.ts
│   │   ├── builds.ts
│   │   └── types.ts
│   │
│   ├── styles/
│   │   ├── theme.css              # Eternal Empire colors
│   │   ├── components.css
│   │   └── animations.css
│   │
│   ├── App.vue
│   └── main.ts
│
└── vite.config.ts
```

### Key Pages

#### 1. Home Page

```vue
<!-- shows hero section, explain what ExileForge does -->
<!-- CTA: "Generate Your First Build" -->
<!-- Features showcase -->
<!-- Screenshots/examples -->
```

#### 2. Builder Page

```vue
<!-- 
Form inputs:
- Textarea: "Describe your desired build"
- Checkboxes: "Allow uniques?", "Allow respec?", "Budget-conscious?"
- Optional: Class selector, ascendancy preference
- Submit button (trigger AI generation)

Loading state:
- Animated loader
- Progress messages: "Generating structure...", "Creating leveling guide..."

Results:
- Display full build with tabs (Overview, Leveling, Gear, Passives, Analysis)
- Save build button
- Share build button (generate public link)
- Download as PDF option
-->
```

#### 3. Build Display Page

```vue
<!--
Tabs:
1. OVERVIEW
   - Build name, class, ascendancy
   - Main skill with explanation
   - Quick stats (life, damage, clear speed rating)
   - Build analysis (strengths/weaknesses)

2. LEVELING
   - Accordion by phase (1-24, 24-48, 48-72, 72-100)
   - Each phase shows: gems, passives, gear targets, notes
   - Respec warnings if applicable

3. GEAR
   - Progression view: Starter → Mid → Endgame
   - Each slot shows: primary item + alternatives
   - Affixes highlighted

4. PASSIVE TREE
   - Visual representation (if possible)
   - Nodes highlighted by phase
   - Keystones marked

5. ANALYSIS
   - Full explanation (rendered markdown)
   - Tips for mapping/bossing
   - Common problems & solutions
-->
```

---

## DEPLOYMENT & DOCKER

### Development Setup

```bash
# Clone repo
git clone https://github.com/yourusername/exileforge.git
cd exileforge

# Setup environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit .env files with your OpenRouter API key
# OPENROUTER_API_KEY=sk_...

# Start with docker-compose
docker-compose up -d

# Migrations
docker exec exileforge-backend npm run migrate

# Frontend available at: http://localhost:5173
# Backend available at: http://localhost:3000
# Database: localhost:5432
```

### Production Deployment

```
Frontend:
- Build: npm run build
- Deploy to: Vercel, Netlify, or your own server
- Environment: VITE_API_URL=https://api.exileforge.com

Backend:
- Build Docker image
- Deploy to: DigitalOcean App Platform, Railway, Render, or K8s
- Environment: DATABASE_URL, OPENROUTER_API_KEY, JWT_SECRET

Database:
- Use managed PostgreSQL (Supabase, RDS, etc)
- OR self-hosted with regular backups

Domain: exileforge.com (or similar)
SSL: Let's Encrypt (automatic with Docker)
```

---

## TIMELINE & NEXT STEPS

### Week 1: Setup & Foundation
- [ ] Frontend boilerplate (Vue3/Vite with Eternal theme)
- [ ] Backend API structure (Express, Auth, CORS)
- [ ] Database schema and Docker setup
- [ ] API client and basic routing

### Week 2: Builder & AI Integration
- [ ] Builder form UI
- [ ] OpenRouter integration (Grok for builds)
- [ ] Build generation pipeline
- [ ] Error handling and fallbacks

### Week 3: Display & Refinement
- [ ] Build display pages (all tabs)
- [ ] Leveling guide rendering
- [ ] Gear progression display
- [ ] Markdown rendering for explanations

### Week 4: User Features & Polish
- [ ] User auth & accounts
- [ ] Build saving functionality
- [ ] Public builds browsing
- [ ] Design polish (Eternal theme refinements)

### Week 5+: Community & Monetization (Phase 2)
- Community features (ratings, comments)
- Search and filtering
- Analytics dashboard
- Payment integration
- Affiliate features

---

## CONSIDERATIONS

### Data Accuracy

**PoE2 Data Requirements:**
- Need up-to-date JSON with: skills, uniques, passives, affixes
- Source: Path of Building Community or game data
- Keep in sync with game patches

### API Rate Limiting

**OpenRouter Considerations:**
- Standard free tier: reasonable limits
- Cache common responses
- Rate limit by user (avoid abuse)
- Monitor costs

### Moderation (Phase 2)

**Public builds need:**
- Review system before publishing
- Reporting mechanism
- Automated filter for spam

---

**Ready to start building? All documentation, prompts, and code 
templates are prepared. Begin with frontend setup and Builder UI.**
