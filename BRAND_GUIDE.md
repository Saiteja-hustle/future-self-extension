# Future Self — Brand & Design System Guide

> **Use this document as the single source of truth for all design decisions across the marketing site, Chrome extension UI, and any future product surfaces.**

---

## 1. Brand Identity

### Brand Name
**Future Self**

### Tagline
*Your PC Doesn't Have a Bedtime. Now It Does.*

### Secondary Taglines (use contextually)
- *The you who wakes up tomorrow is counting on you right now.*
- *Block everything. Even your work. Especially your work.*
- *The most productive thing you can do at midnight is sleep.*

### Brand Positioning
Future Self is **not** a productivity blocker. It is a **sleep protection tool** that treats late-night fake productivity as just as dangerous as late-night entertainment. We are the first product that says: *after your bedtime, EVERYTHING on your screen is a distraction — including your work.*

The name "Future Self" is the brand AND the product mechanic. Every intercept is a conversation between who you are at midnight and who you want to be at 6 AM. The name makes the core psychology impossible to ignore: every late-night screen decision is a trade between present comfort and future capability.

### Brand Personality (The "Who")
Imagine the best version of yourself — tomorrow morning, well-rested, clear-headed — reaching back through time to talk some sense into current-you at midnight. They're not angry. They're not disappointed. They're just... knowing. A little amused. A little "come on, we both know this doc can wait."

**In three words:** Knowing. Warm. Sharp.

**Brand voice spectrum:**
- 70% playful warmth — like your future self texting you "bro, go to bed"
- 20% knowing wit — we see through the "I'm being productive" excuse
- 10% gentle provocation — just enough self-awareness to make you smile and close the laptop

**NEVER:** Clinical. Preachy. Condescending. Corporate. Boring. Health-scare-y. "Wellness influencer." Guilt-trippy.

### The Name as Narrative Device
"Future Self" isn't just a brand name — it's a character in the product. The intercept screen IS your future self talking to you. The streak counter IS your future self keeping score. The override button IS your future self saying "okay, your call." This narrative thread should run through every piece of copy, every UI label, every marketing line. The user is always in dialogue with who they're becoming.

---

## 2. Color System

### Philosophy
The palette is built around **nighttime calm meets intentional self-awareness**. The dark base represents the sleep environment we're protecting. The accent colors are moments of clarity — your future self gently tapping you on the shoulder.

### Core Palette

```
--night-black:       #0B0E14        /* Primary background. Deep, not pure black. The night sky without stars. */
--night-charcoal:    #151923        /* Card/panel backgrounds. Slightly lifted from the void. */
--night-graphite:    #1E2433        /* Secondary surfaces, input fields, elevated containers. */
--night-slate:       #2A3040        /* Borders, dividers, subtle separations. */

--text-primary:      #E8ECF4        /* Primary body text. Warm white, never harsh #FFFFFF. */
--text-secondary:    #8B95A8        /* Secondary text, labels, timestamps. Muted but legible. */
--text-muted:        #525E73        /* Disabled states, placeholder text, de-emphasized elements. */

--accent-green:      #4ADE80        /* The "go to sleep" color. CTAs for the healthy choice. Bright, rewarding. */
--accent-green-glow: rgba(74, 222, 128, 0.15)  /* Subtle glow/highlight behind green elements. */

--accent-amber:      #FBBF24        /* Warning, nudge, "think about it" moments. The pause color. */
--accent-amber-glow: rgba(251, 191, 36, 0.12)

--accent-red-soft:   #F87171        /* Override actions, streak breaks. Not angry red — more "are you sure?" */

--accent-blue:       #60A5FA        /* Informational, links, secondary interactive elements. Cool and trustworthy. */

--gradient-hero:     linear-gradient(135deg, #0B0E14 0%, #1a1040 50%, #0B0E14 100%)
                     /* Hero sections. Hint of deep indigo — nighttime, not neon. */

--gradient-card:     linear-gradient(180deg, #1E2433 0%, #151923 100%)
                     /* Subtle depth on cards. Top slightly lighter. */
```

### Color Usage Rules
- **Green is ALWAYS the healthy choice.** "Go to sleep" buttons, streak counters, active protection status — all green. Green = your future self approves.
- **Gray/muted is ALWAYS the override/bypass.** Override buttons shrink AND desaturate. We don't hide them, we just make the right choice visually louder.
- **Amber for friction moments.** Countdown timers, "think about it" states, warning nudges. Amber = your future self is watching.
- **Never use bright white backgrounds.** This is a nighttime product. Everything sits on dark surfaces.
- **The indigo hint in gradients is nighttime atmosphere, not a brand color.** Use sparingly in hero backgrounds and large surfaces only. Never in UI elements or text.

---

## 3. Typography

### Philosophy
Typography should feel modern, confident, and slightly intimate — like a message from someone who knows you well. Headlines punch. Body text breathes. Microcopy charms.

### Font Stack

**Display / Headlines:**
`"Clash Display", "Satoshi", sans-serif`
- Use: Hero text, section headers, bold statements, the tagline
- Weight: 600 (Semibold) for headlines, 700 (Bold) for hero/impact text
- Character: Geometric, contemporary, confident without being aggressive
- Available from fontshare.com (free for commercial use). Satoshi as fallback.

**Body / UI Text:**
`"General Sans", "DM Sans", sans-serif`
- Use: Paragraphs, descriptions, UI labels, buttons, nav
- Weight: 400 (Regular) for body, 500 (Medium) for labels/buttons, 600 (Semibold) for emphasis
- Character: Clean, highly legible, friendly without being childish
- Available from fontshare.com (free). DM Sans from Google Fonts as fallback.

**Mono / Data / Technical:**
`"JetBrains Mono", "Fira Code", monospace`
- Use: Streak numbers, countdown timers, time displays, sleep math calculations
- Weight: 400-500
- Gives data a "personal dashboard" feel. Sleep hours, block times, streak counts all render in mono.

### Type Scale (Marketing Site)

```
--text-hero:     clamp(3rem, 6vw, 5rem)      /* Hero headline. Big, unapologetic. */
--text-h1:       clamp(2.25rem, 4vw, 3.5rem)  /* Section titles. */
--text-h2:       clamp(1.5rem, 3vw, 2.25rem)  /* Subsection titles. */
--text-h3:       clamp(1.125rem, 2vw, 1.5rem) /* Card titles, feature names. */
--text-body:     1rem / 1.125rem               /* 16-18px body text. */
--text-small:    0.875rem                      /* 14px secondary text. */
--text-caption:  0.75rem                       /* 12px labels, legal. */
```

### Type Scale (Extension UI)

```
--ext-title:     1.25rem    /* 20px. Popup header, intercept headline. */
--ext-body:      0.9375rem  /* 15px. Question text, descriptions. */
--ext-label:     0.8125rem  /* 13px. Status labels, metadata. */
--ext-micro:     0.6875rem  /* 11px. Tiny timestamps, counters. */
```

### Typography Rules
- **Headlines are sentence case.** "Your PC doesn't have a bedtime" — not "Your PC Doesn't Have A Bedtime." Sentence case feels human. Title case feels corporate.
- **Line height:** 1.1-1.2 for headlines, 1.5-1.6 for body text.
- **Letter spacing:** -0.02em on headlines (tighten slightly), 0 on body, +0.05em on all-caps labels.
- **Max body width:** 680px for reading comfort.
- **Microcopy should feel like a message from your future self.** Read it aloud. If it sounds like a person talking to themselves with affection, it's right. If it sounds like a UI string, rewrite it.

---

## 4. Spatial System & Layout

### Spacing Scale (8px base)

```
--space-1:   0.25rem   /*  4px — micro adjustments */
--space-2:   0.5rem    /*  8px — tight grouping */
--space-3:   0.75rem   /* 12px — related elements */
--space-4:   1rem      /* 16px — standard gap */
--space-6:   1.5rem    /* 24px — section internal padding */
--space-8:   2rem      /* 32px — between components */
--space-12:  3rem      /* 48px — between sections */
--space-16:  4rem      /* 64px — major section breaks */
--space-24:  6rem      /* 96px — hero/section vertical rhythm */
```

### Border Radius

```
--radius-sm:   6px     /* Small elements: tags, badges, chips */
--radius-md:   12px    /* Buttons, input fields, small cards */
--radius-lg:   16px    /* Cards, panels, modals */
--radius-xl:   24px    /* Hero cards, featured sections */
--radius-full: 9999px  /* Pills, toggles, avatar circles */
```

### Layout Principles
- **Generous whitespace.** This is a calm product. Don't crowd it. Let elements breathe, especially on the marketing site.
- **Max content width:** 1200px for marketing site. 360px for extension popup. Full viewport for intercept screen.
- **Cards float on dark.** Use `--night-charcoal` or `--gradient-card` on cards sitting on `--night-black` backgrounds. Subtle `box-shadow: 0 4px 24px rgba(0,0,0,0.4)` for depth.
- **Asymmetry is welcome.** Hero sections, feature showcases — break the grid occasionally. Offset images, angled text, overlapping elements. Not chaotic, but not cookie-cutter.

---

## 5. Component Patterns

### Buttons

**Primary (The Healthy Choice):**
```css
background: var(--accent-green);
color: var(--night-black);
font-weight: 600;
padding: 14px 28px;
border-radius: var(--radius-md);
font-size: 1rem;
box-shadow: 0 0 20px var(--accent-green-glow);
transition: all 0.2s ease;
```
- Use for: "Protect My Sleep," "You're right. Goodnight," "Get Started," any positive/sleep action.
- Should feel like the obvious choice. Big, bright, inviting. Your future self nodding in approval.

**Secondary (Neutral Action):**
```css
background: var(--night-graphite);
color: var(--text-primary);
border: 1px solid var(--night-slate);
padding: 12px 24px;
border-radius: var(--radius-md);
```
- Use for: "Settings," "Learn more," secondary navigation.

**Override / De-emphasized:**
```css
background: transparent;
color: var(--text-secondary);
border: 1px solid var(--night-slate);
padding: 10px 20px;
border-radius: var(--radius-md);
font-size: 0.875rem;
opacity: 0.7;
```
- Use for: "Nah, let me through," "Skip," override duration options.
- **Intentionally smaller, quieter, less saturated** than the primary button. We're not hiding it — we're just not shouting about it.

**Override Duration Buttons (Escalating De-emphasis):**
Short durations (2 min, 5 min) -> larger, slightly more visible.
Long durations (60 min, until wake-up) -> smaller, grayer, lower opacity.
Core UX principle: the healthy choice is always the loudest.

### Cards
```css
background: var(--gradient-card);
border: 1px solid var(--night-slate);
border-radius: var(--radius-lg);
padding: var(--space-6);
box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
```

### Input Fields
```css
background: var(--night-graphite);
border: 1px solid var(--night-slate);
border-radius: var(--radius-md);
color: var(--text-primary);
padding: 12px 16px;
/* On focus: */
border-color: var(--accent-blue);
box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
```

### Status Indicators
- **Active/Protected:** Green dot + "Your future self is protected" in green
- **Inactive/Daytime:** Gray dot + "Daytime. Browse freely." in muted text
- **Override Active:** Amber dot + remaining time in mono font

### Streak Display
```
Streak numbers display in monospace.
Current streak gets a subtle green glow.
Broken streak: number resets, brief red-soft flash, then back to neutral.
Label: "7 nights. Your future self approves." (not just "Streak: 7")
```

---

## 6. Iconography & Visual Language

### Icon Style
- **Line icons, 1.5-2px stroke weight.** Rounded caps and joins. Lucide icon set as baseline.
- **Never filled icons** for UI. Filled only for status indicators (green dot = active).
- Color: `--text-secondary` default, `--text-primary` on hover/active, accent colors for status.

### Illustration Style (Marketing Site)
- **No generic stock illustrations.** No floating people. No abstract blobs.
- If illustrations are used, they should be **flat, geometric, dark-themed** — think midnight desk scenes, glowing laptop screens in dark rooms, a figure looking at a mirror showing a brighter version of themselves.
- **Preferred approach:** Use typography and layout as the visual. Future Self's copy is strong enough to carry hero sections without illustration. Bold text + smart spacing + dark atmosphere > clip art.
- **The mirror/reflection motif** can be a subtle design element — a glow, a reflected gradient, a subtle symmetry — that reinforces the "conversation with yourself" concept without being literal or cheesy.

### Emoji / Playful Elements
- Minimal emoji in the marketing site. Let the copy carry the personality.
- In the extension intercept screen, selective emoji can punctuate the question (a single one at the end of a goodnight message). Never more than one per screen. Never in headers.

---

## 7. Motion & Animation

### Philosophy
Motion should feel **calm and self-aware**, like dimming the lights. Never frantic, never bouncy, never "look at me." Smooth, subtle, confident.

### Timing

```
--ease-default:  cubic-bezier(0.4, 0, 0.2, 1)    /* General transitions */
--ease-out:      cubic-bezier(0, 0, 0.2, 1)        /* Elements entering */
--ease-in:       cubic-bezier(0.4, 0, 1, 1)         /* Elements leaving */
--duration-fast:  150ms    /* Hover states, toggles */
--duration-base:  250ms    /* Standard transitions */
--duration-slow:  400ms    /* Page transitions, modals */
--duration-count: 1000ms   /* Countdown timer tick — satisfying, rhythmic */
```

### Key Animations

**Intercept screen entrance:**
- Background fades in (300ms)
- Question text types in or fades up with slight Y-translate (400ms, staggered)
- Countdown begins after question is fully rendered
- Buttons fade in when countdown reaches 0 (200ms)

**Countdown timer:**
- Large monospace numbers. Each second tick has a subtle scale pulse (1.0 -> 1.05 -> 1.0, 200ms).
- Color shifts from `--text-secondary` to `--accent-amber` in last 3 seconds.

**Marketing site:**
- Hero text: staggered fade-up on load. Each line delayed 100ms.
- Section reveals: fade-up on scroll (IntersectionObserver). Subtle, not dramatic.
- Feature cards: slight scale (0.98 -> 1.0) + fade on scroll entry.
- **No parallax.** No scroll-jacking. Smooth and predictable.

---

## 8. Tone of Voice — Copywriting Guide

### The Voice Is the Brand
Future Self's voice IS the product. The name gives us a built-in narrative device: every piece of copy can be framed as a message from the person you'll be tomorrow morning. Use this relentlessly.

### Voice Principles

| Principle | Do This | Not This |
|---|---|---|
| **Knowing, not judgmental** | "We both know that doc can wait." | "You're wasting your time." |
| **Warm, not clinical** | "Sleep is literally free productivity." | "Studies show sleep improves cognitive function by 23%." |
| **Sharp, not preachy** | "That doc will still be there at 7 AM. You'll be sharper too." | "You should really prioritize your sleep health." |
| **Self-aware, not snarky** | "You installed this extension. You asked for this. The irony isn't lost on us." | "You really can't stop, can you?" |
| **Confident, not aggressive** | "The most productive thing you can do right now is sleep." | "STOP USING YOUR COMPUTER!" |

### The "Future Self" Voice Device
When writing intercept questions or product copy, you can frame it as:
- **Your future self talking directly:** "Hey. It's 6:30 AM you. Go to bed. I need you sharp."
- **Third-person future self:** "The version of you who crushes tomorrow morning? They're asleep right now."
- **Self-awareness prompt:** "Quick check: is this for tonight-you or tomorrow-you? Because tomorrow-you votes sleep."

### Copy Formats

**Headlines (marketing):** Bold, punchy, conversational. Often a provocation or reframe.
- "Your Google Doc at midnight isn't productivity. It's procrastination in a blazer."
- "Block everything. Yes, even your work."
- "The most productive thing you can do at 1 AM is sleep."
- "Meet your future self. They want you to close the laptop."

**Subheadlines:** Expand the headline with a knowing wink.
- "Every website blocker blocks Netflix. We also block Notion. Because at midnight, reorganizing your task board isn't work — it's avoidance."
- "Future Self is the first tool that says: after bedtime, everything is a distraction. Even that doc."

**Button labels:** Short, human, decisive.
- "Protect My Sleep" (not "Submit" or "Save Settings")
- "You're right. Goodnight." (not "Close" or "Cancel")
- "Nah, let me through." (not "Override" or "Bypass")
- "My future self can wait." (override — cheeky self-awareness)

**Microcopy:** The personality lives here. Every label, tooltip, and status message is a chance to be human.
- Status active: "Your future self is protected."
- Status inactive: "Daytime. Browse freely."
- Streak: "7 nights. Tomorrow-you approves."
- Streak broken: "Reset. Your future self isn't mad — just start again."
- Onboarding complete: "Done. Your future self just got a bodyguard."

---

## 9. Marketing Site Structure & Design Direction

### Aesthetic Direction
**"Dark editorial meets quiet self-awareness."**

Think: the atmosphere of a well-designed dark-mode SaaS landing page crossed with the editorial boldness of a magazine feature. Heavy on typography. Light on decoration. The site should feel like a late-night conversation with the clearest-thinking version of yourself.

### Page Sections (Suggested)

1. **Hero** — Full-viewport dark gradient. Bold headline. Tagline. Single CTA ("Add to Chrome — free"). No illustration needed — the words are the visual. Consider a subtle mirror/reflection effect on the headline text (a faint glow below, as if reflected on a dark surface).

2. **The Problem** — "It's not just Netflix. It's your Google Doc at midnight." Side-by-side comparison or scrolling reveal of the "Disguises" (fake productivity, pretend research, comfort work, etc.). This is the "aha" section where people recognize themselves.

3. **How It Works** — Three steps, clean cards. (1) Set your wake-up time. (2) We block everything — yes, even work. (3) Your future self asks you one question. Show the sleep math calculation as a live mini-demo if possible.

4. **The Question Gate** — Show an example intercept screen. This IS the product. Let people feel it. Dark card, sample question, countdown, buttons. Frame it: "This is what your future self sounds like at midnight."

5. **What Makes Us Different** — Quick comparison grid vs Cold Turkey, Freedom, etc. Don't trash them. Just show the gap. "They block Netflix. We block Notion."

6. **Social Proof / Testimonials** — Even pre-launch, use a waitlist quote or founder statement. "Built by someone who edited a Google Doc at 1 AM and woke up regretting it."

7. **CTA Footer** — Repeat the main CTA. Personality: "Your future self is waiting. They'll see you at 6:30 AM."

### Responsive Behavior
- Mobile: stack everything. Reduce hero font size (clamp handles this). Single-column cards.
- Tablet: two-column feature grids.
- Desktop: full layout, max-width 1200px centered.

---

## 10. Extension UI Design Direction

### Popup (360px wide)
- Dark background (`--night-black`)
- Status banner at top (green active / gray inactive)
- Block window times in mono
- Tonight's override count
- Streak number (large, mono, green glow if active)
- Settings gear icon bottom-right
- **Minimal.** Glanceable in 2 seconds. Your future self's dashboard.

### Onboarding (Full-tab page)
- Dark, centered, single-column
- Three inputs stacked with generous spacing
- Live calculation preview updates as user adjusts
- Block list as categorized checkboxes with callout: *"Yes, we block work tools too. Because at midnight, work is a distraction from sleep."*
- Big green "Protect My Sleep" button at the bottom
- Header: "Let's set up your future self."

### Intercept Screen (Full-tab takeover)
- **This is the most important screen in the entire product.**
- Full dark background. Centered content. No distractions.
- Top: small text showing the site they tried to visit + current time
- Center: the question in large, warm text (display font, --text-h2 scale). Frame as a message from future self.
- Below question: countdown timer in large mono numerals
- Below timer (after countdown): two buttons — green "You're right. Goodnight." (large) and muted "Nah, let me through." (small)
- The whole screen should feel like a pause. A mirror. A moment of honest self-dialogue.

---

## 11. Brand Motifs & Recurring Visual Threads

### The Mirror / Reflection
The concept of "meeting your future self" implies looking in a mirror. This can manifest subtly:
- Faint reflected glow beneath hero text (as if on a dark glass surface)
- Symmetrical layout moments on the marketing site
- The intercept screen itself IS the mirror — dark, centered, just you and a question
- Never make this literal (no actual mirror illustrations). Keep it atmospheric.

### Time as Tension
Time is central to the product. Lean into it:
- Countdown timers are a core UI element — make them beautiful (large mono, subtle pulse)
- The sleep math (wake time - sleep hours - buffer = block time) should feel satisfying to watch calculate
- Time-of-day awareness in copy: "It's 12:47 AM" hits differently than "It's late"

### The Dialogue
The product is fundamentally a dialogue between present-self and future-self. This shapes everything:
- Intercept questions are addressed to "you" from an implied "I" (your future self)
- Override isn't defiance — it's a conscious negotiation with yourself
- The streak isn't a gamification gimmick — it's evidence of who you're becoming

---

## 12. Do's and Don'ts Cheat Sheet

### DO
- Use dark backgrounds everywhere. This is a nighttime product.
- Let copy carry the personality. Design supports; words lead.
- Make the healthy choice the most visually prominent element on every screen.
- Use monospace for numbers, times, streaks, countdowns.
- Keep the intercept screen sacred. It's the core experience. Obsess over it.
- Frame everything as a conversation with your future self.
- Test every piece of copy by reading it aloud. Does it sound like the best version of you, talking gently to current-you? Ship it.

### DON'T
- Use white or light backgrounds. Ever.
- Use generic AI aesthetics: purple gradients, Inter font, floating illustrations, blob shapes.
- Make override buttons easy or inviting. They exist, but they whisper.
- Use health-scare language. No "destroying your health." No "sleep deprivation causes..."
- Over-animate. Dim-the-lights energy. Not confetti energy.
- Use stock photos of people sleeping. Please.
- Add unnecessary decorative elements. When in doubt, remove.
- Make the "future self" concept cheesy. No time-travel imagery, no sci-fi, no literal mirrors with different reflections. Keep it psychological, not visual.

---

## 13. Technical Implementation Notes for Claude Code

### CSS Custom Properties
Define the entire color/spacing/type system as CSS variables in `:root`. This ensures consistency across every component and makes future theming trivial.

### Font Loading
Load Clash Display, General Sans, and JetBrains Mono from fontshare.com and Google Fonts. Use `font-display: swap` to prevent layout shift.

```html
<!-- Fontshare -->
<link href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700&f[]=general-sans@400,500,600&display=swap" rel="stylesheet">
<!-- Google Fonts fallback -->
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Dark Theme Only
No light mode. No theme toggle. This product lives in the dark. One theme, fully committed.

### Accessibility
- All text meets WCAG AA contrast against dark backgrounds (the palette above is designed for this).
- Focus states use `--accent-blue` outline, not browser default.
- Countdown timer is visual only — include an `aria-live` region for screen readers.
- Button labels are descriptive enough to stand alone without visual context.

### Product Name in Code
- Extension name in manifest.json: "Future Self"
- CSS class prefix: `fs-` (e.g., `fs-intercept`, `fs-countdown`, `fs-button-primary`)
- Storage key prefix: `futureself_` (e.g., `futureself_wakeTime`, `futureself_streak`)



---

*This guide is a living document. As Future Self evolves, update it — but never lose the core: dark, warm, knowing, and unapologetically pro-sleep. Every design decision should pass one test: would your future self approve?*
