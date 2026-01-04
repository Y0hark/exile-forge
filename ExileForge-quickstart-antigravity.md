# ExileForge - Quick Start Guide for Antigravity

**Guide étape-par-étape avec tous les prompts prêts à copier-coller**

---

## PHASE 0: Setup Initial (30 min)

### 1. Créer structure du projet

```bash
# Créer dossiers
mkdir exileforge
cd exileforge
mkdir frontend backend database docs

# Init git
git init
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore

# Backend setup
cd backend
npm init -y
npm install express axios pg jsonwebtoken bcrypt dotenv cors helmet
npm install -D typescript ts-node @types/express @types/node
cd ..

# Frontend setup
cd frontend
npm create vite@latest . -- --template vue-ts
npm install axios pinia markdown-it highlight.js
npm install -D tailwindcss postcss autoprefixer
cd ..
```

### 2. Créer fichiers `.env`

```bash
# backend/.env
DATABASE_URL=postgresql://admin:password@localhost:5432/exileforge
OPENROUTER_API_KEY=sk_...  # Tu la auras d'OpenRouter
JWT_SECRET=your-secret-key-here
NODE_ENV=development
PORT=3000

# frontend/.env.local
VITE_API_URL=http://localhost:3000
```

### 3. Docker Compose

Copie le contenu du document principal dans `docker-compose.yml`

---

## PHASE 1: Database & Backend Setup

### PROMPT 1 (Antigravity): Create Database Schema

**Usage:** Copie ce prompt dans Antigravity, ajoute le output à `database/schema.sql`

```
Generate a complete PostgreSQL schema for ExileForge with:

Tables needed:
1. users (id, email, username, password_hash, created_at)
2. user_preferences (id, user_id, prefer_no_uniques, prefer_no_rare_uniques, allow_respec)
3. builds (id, user_id, name, class, ascendancy, main_skill, playstyle_description, build_data JSONB, created_at, updated_at, is_public, downloads)
4. build_versions (id, build_id, version_number, build_data, created_at)

Requirements:
- Add all necessary indexes
- Add foreign key constraints with CASCADE delete
- Add timestamps for all tables
- Add health checks
- Use JSONB for build_data (to store complete build structure)

Return: Complete SQL that can run with "psql < schema.sql"
Include CREATE INDEX statements for performance.
```

### PROMPT 2 (Antigravity): Create Express Backend Structure

**Usage:** Generate base server structure

```
Generate a production-ready Express.js server for ExileForge with:

Structure needed:
1. Express app setup with middleware (cors, helmet, auth)
2. PostgreSQL connection pool setup
3. JWT authentication middleware
4. Error handling middleware
5. Routes structure (auth, builds, preferences)
6. Database helper functions

Requirements:
- Use TypeScript
- Connection pooling with pg
- Environment variable loading
- CORS configured for localhost:5173 and production
- Global error handler
- Request logging

Return: Complete main server file (server.ts) that's ready to run.
Include: app setup, middleware, route mounting points, error handlers.

Example route structure:
POST /api/auth/register
POST /api/auth/login
GET /api/builds/:id
POST /api/builds/generate
(... more routes as defined)

Make it production-ready and modular.
```

### PROMPT 3 (Antigravity): Auth Service Implementation

**Usage:** Generate authentication routes

```
Create authentication service for ExileForge with these endpoints:

POST /api/auth/register
- Accept: email, username, password
- Hash password with bcrypt
- Create user in database
- Return: user object + JWT token

POST /api/auth/login
- Accept: email/username, password
- Check credentials against hashed password
- Return: user object + JWT token
- Error: 401 if invalid

GET /api/auth/me
- Protected route (requires JWT)
- Return: current user profile

POST /api/auth/refresh
- Accept: old token
- Issue new token if valid
- Error: 401 if expired beyond refresh window

Requirements:
- Use bcrypt for password hashing
- JWT tokens expire in 24 hours
- Refresh tokens last 30 days (optional for MVP)
- All passwords hashed and salted
- SQL injection prevention (use parameterized queries)
- Rate limiting considerations mentioned

Return: Complete auth routes file (routes/auth.ts) ready to integrate.
Include: middleware for authentication, password validation, error cases.
```

---

## PHASE 2: API Endpoints for Build Generation

### PROMPT 4 (Antigravity): Build Service Base

**Usage:** Generate build storage/retrieval endpoints

```
Create build service for ExileForge with these endpoints:

POST /api/builds/generate
- Accept: playstyle_description, class?, allow_uniques?, allow_respec?, preferred_ascendancy?
- Call OpenRouter API (implementation in next step)
- Save result to database
- Return: complete build object

GET /api/builds/:id
- Retrieve build from database
- Include full build_data (JSONB)
- Return: build with all details

PUT /api/builds/:id
- Update build data (only if user owner)
- Keep version history
- Return: updated build

DELETE /api/builds/:id
- Delete build (only if user owner)
- Return: success response

GET /api/builds/user/:userId
- List all builds by user
- Return: array of builds (no JSONB data, just summaries)

GET /api/builds/public
- List all public builds (for browsing)
- Include: search/filter by class, playstyle, main_skill
- Pagination (20 per page)
- Return: array of public builds + total count

POST /api/builds/:id/publish
- Make build public
- Requires user to be owner
- Return: updated build

Requirements:
- All write operations protected by JWT + ownership check
- Use connection pool for database queries
- Proper error handling (404 if not found, 403 if not owner)
- SQL parameterized queries to prevent injection

Return: Complete build routes file (routes/builds.ts).
Include: database query functions, ownership checks, error cases.
```

### PROMPT 5 (Antigravity): OpenRouter Integration Service

**Usage:** Generate AI integration module

```
Create OpenRouter integration service for ExileForge that:

Function 1: generateBuild(userRequest, preferences)
- Call OpenRouter API with Claude or Grok
- Use system prompt for PoE2 build generation
- Return: parsed JSON build object

Function 2: generateExplanation(build)
- Call OpenRouter API with Claude
- Generate detailed build explanation (markdown)
- Return: markdown text

Function 3: generateLevelingGuide(build)
- Call OpenRouter API with Claude
- Generate leveling guide by phases (1-24, 24-48, 48-72, 72-100)
- Return: structured guide data

Function 4: generateAlternatives(build)
- Call OpenRouter API with Claude
- Suggest alternatives for each recommended item
- Return: alternatives structure

Requirements:
- Use axios for HTTP calls
- Error handling: timeouts, API errors, rate limits
- Retry logic (3 attempts with exponential backoff)
- Streaming support for long responses
- Proper API key management (from env)
- Cost estimation and logging
- Fallback model if primary fails

Models to use:
- Grok-3: Build structure generation (cheaper, faster)
- Claude-3-5-Sonnet: Explanations and guides (better quality)
- Mistral-Large-2: Fallback option

Return: Complete OpenRouter service file (services/openrouter.ts).
Include: all functions above, error handling, retry logic, streaming setup.

Example function signature:
async generateBuild(userRequest: string, preferences: BuildPreferences): Promise<Build>
```

---

## PHASE 3: Frontend Setup

### PROMPT 6 (Antigravity): Vue3 Store Setup (Pinia)

**Usage:** Generate state management

```
Create Pinia stores for ExileForge frontend with:

Store 1: auth.ts
- State: currentUser, token, isAuthenticated, isLoading
- Actions: login, register, logout, refreshToken, loadProfile
- Getters: isLoggedIn, userEmail, userName
- Persist token to localStorage

Store 2: builds.ts
- State: builds (array), currentBuild, isLoading, error
- Actions: generateBuild, saveBuild, deleteBuild, loadBuild, fetchUserBuilds
- Getters: userBuilds, recentBuilds, favoriteBuilds

Store 3: ui.ts
- State: currentTab, sidebarOpen, theme (light/dark)
- Actions: setTab, toggleSidebar, setTheme
- Getters: activeTab

Store 4: preferences.ts
- State: allowUniques, allowRespec, budgetMode
- Actions: updatePreferences
- Persist to localStorage

Requirements:
- Use TypeScript with proper typing
- Implement localStorage persistence
- Add loading states
- Error handling with try-catch
- API calls via injected service

Return: Complete Pinia store files ready to integrate.
Include: types.ts with all interfaces, store initialization.

Example structure:
export const useAuthStore = defineStore('auth', () => { ... })
```

### PROMPT 7 (Antigravity): API Client Setup

**Usage:** Generate HTTP client for frontend

```
Create axios-based API client for ExileForge frontend with:

Features needed:
1. Base axios instance with API_URL from env
2. Auth interceptor: add JWT token to all requests
3. Error interceptor: handle 401 (redirect to login), 403, 500
4. Request/response logging (dev only)

API functions:
- Auth: login, register, logout, refreshToken, getProfile
- Builds: generateBuild, getBuild, updateBuild, deleteBuild, listUserBuilds, listPublicBuilds
- Preferences: getPreferences, updatePreferences

Requirements:
- Automatic JWT injection in headers
- Handle token refresh on 401
- User-friendly error messages
- Request timeout: 30 seconds
- Retry failed requests (except auth)

Return: Complete API client file (api/client.ts) with all functions.
Include: request/response types, interceptors, utility functions.

Example usage in components:
const { build, loading } = await buildApi.generateBuild(userRequest)
```

### PROMPT 8 (Antigravity): Eternal Empire Theme CSS

**Usage:** Generate design system styles

```
Create Tailwind/CSS design system for ExileForge with Eternal Empire theme.

Color palette:
- Primary: #1a1a2e (Deep Eternal Black)
- Secondary: #d4af37 (Gold/Eternal accent)
- Accent: #8b0000 (Blood Red - Cultist)
- Danger: #ff6b6b (Bright Red)
- Success: #51cf66 (Ethereal Green)
- Background: #0f0f1e (Void Black)
- Surface: #2d2d44 (Dark surface)
- Border: #4a4a66

Typography:
- Headings: Cinzel (serif, majestic)
- Body: Inter (sans-serif, modern)
- Mono: JetBrains Mono

Components to style:
1. Buttons: primary (gold bg), secondary (border), danger (red)
2. Cards: dark bg + gold accent border
3. Inputs: dark bg, gold border on focus
4. Alerts: by type (error=red, success=green, info=blue)
5. Navbar: dark with gold accents
6. Loading spinner: animated gold

Requirements:
- Mobile responsive
- Dark mode by default
- Smooth transitions (200ms)
- Subtle glow effects on hover
- Tailwind CSS compatible
- CSS custom properties for easy theming

Return: Complete CSS file (styles/theme.css) with:
- Color variables
- Component styles
- Responsive utilities
- Animation definitions

Include: example usage in components.
```

---

## PHASE 4: Builder & Results Pages

### PROMPT 9 (Antigravity): Builder Form Component

**Usage:** Generate the form for build input

```
Create Vue3 component for ExileForge builder form with:

Form fields:
1. Textarea (required): "Describe your desired build"
   - Placeholder: "e.g., I want a cold damage-based monk..."
   - Min 20 chars, max 500 chars

2. Dropdown (optional): Class selection
   - Options: Warrior, Ranger, Mage, Duelist, Witch, Templar, Shadow, "Auto-select"

3. Dropdown (optional): Ascendancy preference
   - Options: "Any", then specific ascendancies

4. Checkboxes:
   - "Allow unique items?" (default: checked)
   - "Allow respec?" (default: checked)
   - "Budget-conscious mode" (default: unchecked)

5. Button: Submit (disabled while loading)

Features needed:
- Form validation (textarea min length)
- Loading state: disable submit, show spinner
- Error messages: display backend errors
- Success handling: navigate to results
- Saved preferences: remember user choices

Styling:
- Use Eternal Empire theme
- Gold borders on focus
- Smooth transitions
- Dark background

Return: Complete Vue3 component (components/BuilderForm.vue) with:
- Setup composition API
- Form validation
- API call to backend
- Error/success handling
- Loading states

Include: TypeScript types, emitted events.
```

### PROMPT 10 (Antigravity): Build Results Display Component

**Usage:** Generate multi-tab results viewer

```
Create Vue3 component for ExileForge build results with 5 tabs:

TAB 1: OVERVIEW
- Build name, class, ascendancy
- Main skill with icon/description
- Quick stats box (Life, DPS estimate, clear speed rating)
- Build analysis summary (strengths/weaknesses, 3 each)
- Mapping/Bossing/Survival ratings (1-10 with bars)

TAB 2: LEVELING GUIDE
- Accordion with 4 phases: 1-24, 24-48, 48-72, 72-100
- Each phase shows:
  - Gem setup (main + supports)
  - Passive nodes to allocate (highlighted)
  - Gear targets (slot + affixes)
  - Gem slot progression (2→3→4 links)
  - Boss tips
  - Important notes

TAB 3: GEAR PROGRESSION
- 3 columns: Starter (Lv 1-24) | Mid (Lv 24-72) | Endgame (Lv 72+)
- Each slot shows:
  - Priority badge (Core/Important/Optional)
  - Item name + rarity
  - Key affixes
  - Alternatives (expandable)
  - "Why this item" tooltip

TAB 4: PASSIVE TREE
- Visual representation (simplified, not full tree)
- Nodes highlighted by phase (different colors)
- Keystones marked with special icon
- Life/Damage targets by phase

TAB 5: FULL EXPLANATION
- Markdown rendered content
- Sections: Core concept, skill breakdown, gear strategy, playstyle tips, endgame content
- Code blocks highlighted
- Smooth scrolling

Features:
- Save build button (authenticated users)
- Share build button (copy link/QR code)
- Download as PDF
- Print-friendly styling
- Responsive on mobile
- Dark theme with gold accents

Return: Complete component (components/BuildResults.vue) with:
- Tab management
- Data rendering from build object
- Markdown rendering integration
- Print/share functionality
- Save/download handlers

Include: TypeScript types, helper functions.
```

---

## PHASE 5: User Authentication

### PROMPT 11 (Antigravity): Login & Register Forms

**Usage:** Generate auth pages

```
Create Vue3 components for ExileForge authentication:

Component 1: LoginForm.vue
- Email field (text input)
- Password field (password input)
- Submit button
- "Forgot password?" link (disabled for MVP)
- "Sign up instead" link
- Remember me checkbox
- Error message display
- Loading state during submission

Component 2: RegisterForm.vue
- Email field (with validation)
- Username field (2-20 chars alphanumeric)
- Password field (min 8 chars, requirements shown)
- Confirm password field
- Terms checkbox (required)
- Submit button
- "Already have account?" link
- Error message display
- Success message after registration

Features:
- Client-side validation before submit
- Async validation: check if email/username exists
- Show/hide password toggle
- Auto-focus on error fields
- Keyboard support (Enter to submit)
- Rate limiting info (if needed)

Styling:
- Eternal Empire dark theme
- Gold accent borders
- Centered form layout
- Mobile responsive
- Loading spinner on buttons

Return: Both components (components/Auth/*.vue) ready to use.
Include: form validation, API integration, error handling.
```

---

## PHASE 6: Build Management & Display

### PROMPT 12 (Antigravity): My Builds Page

**Usage:** List and manage saved builds

```
Create Vue3 component for ExileForge "My Builds" page showing:

Layout:
- Header: "My Builds" with new build button
- Filters: by class, playstyle, main skill
- Search box: search by build name

Build list:
- Grid or table view
- Each build card shows:
  - Build name (large, clickable)
  - Class + Ascendancy
  - Main skill
  - Created date, last updated
  - Downloads count (if public)
  - Action buttons: View, Edit, Delete, Publish/Unpublish

Features:
- Delete confirmation dialog
- Sorting: by date, by name, by class
- Pagination (10-20 per page)
- Empty state: "No builds yet, create one!"
- Loading skeleton while fetching
- Public/Private badge on cards

Styling:
- Eternal Empire dark cards
- Gold accents
- Hover effects
- Responsive grid

Return: Complete component (views/MyBuilds.vue).
Include: API calls, state management, dialogs.
```

### PROMPT 13 (Antigravity): Build Display Page

**Usage:** View individual build (this is the big one)

```
Create Vue3 view component for ExileForge build display page.

Route: /builds/:id

Layout:
- Header with build name, class, ascendancy
- Tab navigation (Overview, Leveling, Gear, Passives, Explanation)
- Action bar: Save, Share, Download PDF, Print

(Use detailed spec from PROMPT 10 for tab contents)

Additional features:
- Auto-scroll to tab on load
- Deep linking to specific sections
- Comments section placeholder (Phase 2)
- Related builds suggestion (Phase 2)
- Copy to clipboard buttons for code/stats

Styling:
- Full-width on desktop
- Responsive on tablet/mobile
- Syntax highlighting for code blocks
- Print-optimized styles

Return: Complete view component (views/BuildDisplay.vue).
Include: tab management, markdown rendering, print functions.
```

---

## RUNNING EVERYTHING

### Startup Sequence

```bash
# Terminal 1: Database
docker-compose up postgres

# Terminal 2: Backend
cd backend
npm run dev

# Terminal 3: Frontend
cd frontend
npm run dev

# Access:
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
# Database: localhost:5432
```

### Testing Flow

```
1. Register new account
2. Click "Generate Build"
3. Enter: "I want a cold damage mage focused on endgame"
4. See loading spinner (AI generating)
5. Get full build with all tabs
6. Click "Save Build"
7. Go to "My Builds"
8. See saved build
9. Click to view full build
10. Check Leveling tab for gem progression
11. Check Gear tab for alternatives
```

---

## PROMPT QUICK REFERENCE

| # | Name | Usage | Output |
|---|------|-------|--------|
| 1 | Database Schema | PostgreSQL | `schema.sql` |
| 2 | Express Backend | Server setup | `server.ts` |
| 3 | Auth Service | Login/Register | `routes/auth.ts` |
| 4 | Build Service | CRUD builds | `routes/builds.ts` |
| 5 | OpenRouter Service | AI integration | `services/openrouter.ts` |
| 6 | Pinia Stores | State management | `stores/` folder |
| 7 | API Client | HTTP client | `api/client.ts` |
| 8 | Theme CSS | Design system | `styles/theme.css` |
| 9 | Builder Form | Input form | `components/BuilderForm.vue` |
| 10 | Build Results | Multi-tab display | `components/BuildResults.vue` |
| 11 | Auth Forms | Login/Register | `components/Auth/*.vue` |
| 12 | My Builds | Manage builds | `views/MyBuilds.vue` |
| 13 | Build Display | View single build | `views/BuildDisplay.vue` |

---

## PRIORITY ORDER FOR ANTIGRAVITY

**Start with these in order (each 30-60 min):**

1. **Database Schema** (5 min) - Just run SQL
2. **Express Backend** (30 min) - All middleware
3. **Auth Service** (20 min) - Login/register
4. **Build Service** (25 min) - CRUD endpoints
5. **OpenRouter Service** (25 min) - AI calls
6. **Pinia Stores** (20 min) - State
7. **API Client** (15 min) - HTTP layer
8. **Theme CSS** (20 min) - Styling
9. **Builder Form** (30 min) - Main interaction
10. **Build Results** (45 min) - Display
11. **Auth Forms** (25 min) - UI
12. **My Builds** (20 min) - Management
13. **Build Display** (30 min) - Full view

**Total: ~5-6 hours for MVP**

---

**All prompts are ready to copy-paste into Antigravity. 
Start with #1 and work sequentially. Each prompt is self-contained.**
