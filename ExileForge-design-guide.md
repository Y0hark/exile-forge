# ExileForge - Design & UX Guide

**Spécifications détaillées du design Eternal Empire + User Experience**

---

## DESIGN PHILOSOPHY

### Inspiration: Aggorat (Act 3 - Eternal Control)

**Thème:** Dark empire aesthetic, controlled chaos, cultist architecture, ziggurat presence.

**Key characteristics:**
- Dark, sophisticated, not cartoony
- Gold accents = power, authority, eternal quality
- Blood red = danger, power, cult presence
- Void black = mystery, depth, the Eternal
- Modern sans-serif balances ancient serif for contrast

---

## COLOR PALETTE (Hex + Usage)

### Primary Colors

```css
:root {
  /* Main brand colors */
  --color-eternal-black: #1a1a2e;      /* Primary - Headers, text */
  --color-eternal-gold: #d4af37;       /* Accent - Highlights, CTAs */
  --color-eternal-red: #8b0000;        /* Accent - Danger, blood */
  
  /* Dark mode backgrounds */
  --color-bg-primary: #0f0f1e;         /* Page background */
  --color-bg-secondary: #1a1a2e;       /* Slightly lighter */
  --color-bg-surface: #2d2d44;         /* Cards, inputs */
  --color-bg-elevated: #3a3a52;        /* Modals, dropdowns */
  
  /* Borders and dividers */
  --color-border-primary: #4a4a66;     /* Default borders */
  --color-border-accent: #d4af37;      /* Gold borders (focus, active) */
  --color-border-danger: #ff6b6b;      /* Red borders (errors) */
  
  /* Text colors */
  --color-text-primary: #e0e0e0;       /* Main text */
  --color-text-secondary: #a0a0b0;     /* Secondary text, labels */
  --color-text-disabled: #6a6a7e;      /* Disabled, placeholder */
  
  /* Status colors */
  --color-success: #51cf66;            /* Ethereal green */
  --color-warning: #ffa500;            /* Orange - Warning */
  --color-error: #ff6b6b;              /* Red - Error */
  --color-info: #6ec6ff;               /* Blue - Information */
  
  /* Utility */
  --color-skeleton: #4a4a66;           /* Loading skeleton */
  --color-shadow: rgba(0, 0, 0, 0.5);  /* Shadows */
  --color-overlay: rgba(0, 0, 0, 0.8); /* Modal overlay */
}
```

### Usage Guidelines

```
Primary Text: --color-eternal-black or --color-text-primary
Secondary Text: --color-text-secondary
Headings: --color-eternal-black + --color-eternal-gold as accent
Links: --color-eternal-gold (underline on hover)
Buttons: --color-eternal-gold bg, --color-eternal-black text
Cards: --color-bg-surface with --color-border-primary border
Active States: --color-eternal-gold border/bg
Focus States: --color-eternal-gold outline
Error States: --color-error
```

---

## TYPOGRAPHY

### Font Stack

```css
:root {
  /* Majestic heading font */
  --font-serif: 'Cinzel', 'Garamond', serif;
  
  /* Clean body font */
  --font-sans: 'Inter', 'Segoe UI', -apple-system, sans-serif;
  
  /* Monospace for code */
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### Sizes & Weights

```css
/* Headings */
h1 { font-size: 3.5rem; font-weight: 700; font-family: var(--font-serif); }
h2 { font-size: 2.5rem; font-weight: 700; font-family: var(--font-serif); }
h3 { font-size: 1.75rem; font-weight: 600; font-family: var(--font-serif); }
h4 { font-size: 1.25rem; font-weight: 600; font-family: var(--font-sans); }

/* Body text */
body { font-size: 1rem; font-weight: 400; line-height: 1.5; }
small { font-size: 0.875rem; }
.text-xs { font-size: 0.75rem; }

/* Emphasis */
strong { font-weight: 600; }
em { font-style: italic; }
.uppercase { text-transform: uppercase; letter-spacing: 0.05em; }
```

---

## COMPONENTS

### Buttons

**Primary Button (Main CTA)**
```
Background: --color-eternal-gold (#d4af37)
Text: --color-eternal-black
Border: 2px solid --color-eternal-gold
Padding: 12px 24px
Font: 16px, weight 600
Border-radius: 6px
Cursor: pointer
Transition: all 200ms ease

States:
- Hover: Brighter gold (#e8c547), slight shadow
- Active: Darker gold (#c7a032)
- Disabled: Opacity 50%, cursor not-allowed
- Loading: Show spinner, disable interactions
```

**Secondary Button**
```
Background: transparent
Text: --color-eternal-gold
Border: 2px solid --color-eternal-gold
Otherwise same as primary
```

**Danger Button**
```
Background: --color-error (#ff6b6b)
Text: white
Border: 2px solid --color-error
Otherwise same as primary
```

**Subtle Button (Icon, Close)**
```
Background: transparent
Text: --color-text-secondary
Border: none
Padding: 8px 16px
Hover: Text becomes --color-eternal-gold
```

### Input Fields

```
Background: --color-bg-surface (#2d2d44)
Border: 2px solid --color-border-primary (#4a4a66)
Text: --color-text-primary
Placeholder: --color-text-disabled
Padding: 12px 16px
Border-radius: 6px
Font: 16px, inherit

States:
- Focus: Border becomes --color-eternal-gold, outline: 2px solid gold
- Hover: Border color lightens
- Error: Border becomes --color-error, show error message below
- Disabled: Opacity 50%, background slightly lighter
- Filled: Border color changes to gold

Validation:
- Show red border + error message immediately
- Or show on blur (friendlier)
- Green checkmark on valid (optional)
```

### Cards

```
Background: --color-bg-surface (#2d2d44)
Border: 2px solid --color-border-primary (#4a4a66)
Padding: 24px
Border-radius: 8px
Shadow: 0 4px 12px rgba(0,0,0,0.3)

Accent: Left border 4px gold (for emphasis)

Hover:
- Shadow becomes 0 8px 24px rgba(0,0,0,0.4)
- Slight translation (transform: translateY(-2px))
- Border color lightens

Mobile:
- Padding: 16px
- Full width with 16px margins
```

### Modals / Dialogs

```
Overlay: --color-overlay (rgba(0,0,0,0.8))
Content: --color-bg-elevated (#3a3a52)
Border: 2px solid --color-border-primary
Padding: 32px
Border-radius: 12px
Box-shadow: 0 20px 60px rgba(0,0,0,0.5)

Animation:
- Fade in: opacity 0 → 1 (200ms)
- Slight scale: scale(0.95) → scale(1) (200ms)

Close button: Top right, X icon, gold on hover
```

### Form Labels

```
Font-size: 14px
Font-weight: 600
Color: --color-text-primary
Margin-bottom: 8px
Uppercase letter-spacing: 0.05em (optional)

Required indicator: Red asterisk (*) after label
```

### Tooltips

```
Background: --color-eternal-black
Text: --color-eternal-gold
Padding: 8px 12px
Border-radius: 4px
Font-size: 12px
Max-width: 200px

Arrow: Pointer arrow to hover element
Appear: Fade in 100ms after 200ms hover
Fade out: 100ms on leave
```

---

## LAYOUT PATTERNS

### Navbar

```
Height: 64px
Background: --color-bg-secondary (#1a1a2e)
Border-bottom: 2px solid --color-border-primary
Padding: 0 32px

Content:
- Left: Logo + "ExileForge" text (gold)
- Center: Navigation links (hover = gold underline)
- Right: User menu (avatar + dropdown) or Login button

Mobile:
- Hamburger menu
- Dropdown navigation
- Sticky on scroll
```

### Sidebar (if used)

```
Width: 280px (desktop) / hidden (mobile)
Background: --color-bg-secondary
Border-right: 2px solid --color-border-primary
Padding: 24px 16px

Content: Filters, navigation, info
Active item: Gold left border + slightly brighter bg
```

### Main Content Area

```
Desktop: sidebar (280px) + main (remaining)
Tablet: 100% width
Mobile: 100% width, stacked

Padding: 32px (desktop) / 16px (mobile)
Max-width: 1200px
Margin: auto
```

### Hero Section

```
Background: Gradient from --color-bg-primary to --color-bg-secondary
Min-height: 400px
Padding: 80px 32px
Text-align: center

Main heading: H1, gold color, serif font
Subheading: Body text, secondary color
CTA button: Primary button below

Image: Optional hero image (dark themed, PNG with transparency)
```

---

## ANIMATIONS

### Transitions

```css
/* Smooth interaction */
--transition-fast: 150ms ease;
--transition-normal: 250ms ease;
--transition-slow: 350ms ease;

/* Easing */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Common Animations

```css
/* Fade */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide */
@keyframes slideInUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale pop */
@keyframes popIn {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* Loading spinner */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Glow effect (on hover) */
@keyframes glow {
  0%, 100% { box-shadow: 0 0 10px rgba(212, 175, 55, 0.3); }
  50% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.6); }
}
```

### Usage

```
Buttons on hover: Smooth color transition (--transition-fast)
Cards on hover: Scale + shadow (--transition-normal)
Modal appears: Fade + scale animation (--transition-normal)
Page navigation: Fade between pages (--transition-normal)
Loading states: Spin animation continuous
Form errors: Shake animation (brief)
```

---

## RESPONSIVE DESIGN

### Breakpoints

```css
$mobile: 320px;
$tablet: 768px;
$desktop: 1024px;
$wide: 1280px;
```

### Mobile-first Approach

```
1. Design for mobile (320px+)
2. @media (min-width: 768px) - Tablet improvements
3. @media (min-width: 1024px) - Desktop layout
4. @media (min-width: 1280px) - Wide screen optimization
```

### Key Changes by Breakpoint

**Mobile (320px):**
- Single column layout
- Full-width cards with 16px margin
- Hamburger navigation
- Smaller font sizes
- Touch-friendly buttons (44px minimum)

**Tablet (768px):**
- 2-column grid for builds
- Side navigation collapse to icons
- Larger padding (24px)
- Normal font sizes

**Desktop (1024px+):**
- 3+ column grids
- Full sidebar visible
- Standard padding (32px)
- Full typography

---

## DARK MODE ONLY

ExileForge is **dark-mode only** (matches PoE2 aesthetic).

No light mode needed for MVP. If added later:

```css
@media (prefers-color-scheme: light) {
  /* Invert colors while maintaining gold accent */
  /* Rare to implement for games, skip for MVP */
}
```

---

## ICONS

### Icon Set

Use **Font Awesome** (free) or **Heroicons** (modern):

```html
<!-- Heroicons example -->
<svg class="w-6 h-6" fill="none" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="..."/>
</svg>
```

### Common Icons Needed

```
- Menu (hamburger)
- X (close)
- Plus (add)
- Trash (delete)
- Edit (pencil)
- Download
- Share
- Heart (favorite)
- Eye (show)
- Eye-off (hide)
- Settings
- User (profile)
- Logout
- Home
- Folder (my builds)
- Search
- Loading (spinner)
- Check (success)
- Alert (warning)
- Alert-circle (error)
```

### Icon Color

```
Default: --color-text-primary or --color-text-secondary
Hover: --color-eternal-gold
Active: --color-eternal-gold
Error: --color-error
Success: --color-success
```

---

## SPACING SYSTEM

Use 8px grid for consistency:

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;
```

### Usage

```
Padding: Use multiples of 8px
Margin: Use multiples of 8px
Gap (flexbox): Use multiples of 8px
Border-radius: 4px (small), 6px (medium), 8px (large)
Border-width: 1px (normal), 2px (accent)
```

---

## ACCESSIBILITY (A11Y)

### Requirements

- **Color contrast:** 4.5:1 for normal text, 3:1 for large text
- **Focus indicators:** Always visible (gold outline)
- **Keyboard navigation:** All interactive elements accessible via Tab
- **ARIA labels:** Buttons, icons, form fields need labels
- **Alt text:** Images need alt attributes
- **Semantic HTML:** Use proper heading hierarchy, `<button>` for buttons, etc.

### Implementation

```html
<!-- Good -->
<button type="button" aria-label="Close dialog">
  <svg aria-hidden="true">...</svg>
</button>

<input type="email" aria-label="Email address" placeholder="you@example.com" />

<label for="class-select">Choose class:</label>
<select id="class-select" name="class">
  <option>Warrior</option>
</select>

<!-- Bad -->
<div onclick="...">Click me</div> <!-- Not keyboard accessible -->
<span role="button">Click me</span> <!-- Use <button> instead -->
<img src="..." /> <!-- Missing alt text -->
```

---

## LOADING STATES

### Skeleton Loading

While data loads, show skeleton:

```css
background: linear-gradient(
  90deg,
  --color-skeleton 25%,
  --color-bg-elevated 50%,
  --color-skeleton 75%
);
background-size: 200% 100%;
animation: loading 1.5s infinite;

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Spinners

Animated gold spinner for processing:

```html
<div class="spinner"></div>
```

```css
.spinner {
  border: 4px solid --color-border-primary;
  border-top: 4px solid --color-eternal-gold;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}
```

### Loading Messages

Show status updates:

```
"Generating build structure..."
"Creating leveling guide..."
"Optimizing gear recommendations..."
"Finalizing build..."
```

---

## ERROR STATES

### Form Validation

```
- Invalid input: Red border + error message below input
- Message example: "Email must be valid"
- Color: --color-error (#ff6b6b)
- Font-size: 12px
- Margin-top: 4px
```

### API Errors

```
- Toast notification (bottom right, 4s auto-dismiss)
- Background: --color-error or --color-warning
- Text: white
- Icon: Alert triangle
- Include retry button if applicable
```

### Not Found Page

```
- Large "404" heading (Cinzel font)
- "Build not found" subheading
- "Return to home" button (gold)
- Subtle Eternal Empire background image
```

---

## PRINT STYLES

### Print-friendly Build Display

```css
@media print {
  /* Hide: navigation, buttons, ads */
  .navbar, .sidebar, .action-buttons { display: none; }
  
  /* Show all content */
  body { background: white; color: black; }
  
  /* Page breaks */
  .section { page-break-inside: avoid; }
  
  /* No background colors */
  .card { background: white; border: 1px solid black; }
  
  /* Full width */
  .container { max-width: 100%; }
}
```

---

## FINAL CHECKLIST

Before launch:

- [ ] All colors use CSS variables
- [ ] All spacing uses 8px grid
- [ ] Fonts loaded from Google Fonts or local
- [ ] Dark mode only (no light mode)
- [ ] Mobile responsive tested
- [ ] Keyboard navigation tested
- [ ] Focus indicators visible
- [ ] Loading states shown
- [ ] Error states handled
- [ ] Animations smooth (60fps)
- [ ] Print styles working
- [ ] Accessibility checked (WAVE tool)
- [ ] Performance OK (Lighthouse)

---

**Design system complete. Use these specs for all components.**
