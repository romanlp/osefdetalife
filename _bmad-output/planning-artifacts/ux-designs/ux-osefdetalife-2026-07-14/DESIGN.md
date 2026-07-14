---
name: Bookable
description: White-label restaurant booking platform. Warm minimal aesthetic — quiet confidence, earthy tones, generous whitespace. Widget is fully white-labeled; dashboard is platform-branded.
colors:
  # Light mode
  surface-base: '#F5F0EB'
  surface-raised: '#FFFFFF'
  ink-primary: '#1A1A1A'
  ink-secondary: '#6B6B6B'
  ink-disabled: '#B5B0AA'
  accent: '#8FA67A'
  accent-hover: '#7A9168'
  border-hairline: '#E5E0DB'
  success: '#8FA67A'
  error: '#C44B4B'
  # Dark mode
  surface-base-dark: '#1A1A1A'
  surface-raised-dark: '#252320'
  ink-primary-dark: '#F5F0EB'
  ink-secondary-dark: '#9A9590'
  ink-disabled-dark: '#5A5550'
  accent-dark: '#A8C48A'
  accent-hover-dark: '#96B378'
  border-hairline-dark: '#3A3632'
  success-dark: '#A8C48A'
  error-dark: '#E06060'
typography:
  family: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
  heading:
    fontWeight: '700'
    letterSpacing: '-0.01em'
  body:
    fontWeight: '400'
  meta:
    fontWeight: '500'
rounded:
  sm: 8px
  md: 12px
  lg: 16px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 24px
  '6': 32px
  '7': 48px
components:
  button-primary:
    background: '{colors.ink-primary}'
    foreground: '{colors.surface-base}'
    radius: '{rounded.md}'
    fontWeight: '600'
  button-secondary:
    background: '{colors.accent}'
    foreground: '{colors.ink-primary}'
    radius: '{rounded.md}'
    fontWeight: '600'
  card:
    background: '{colors.surface-raised}'
    radius: '{rounded.md}'
    border: '1px solid {colors.border-hairline}'
    shadow: '0 1px 3px rgba(0,0,0,0.04)'
  input:
    background: '{colors.surface-raised}'
    border: '1px solid {colors.border-hairline}'
    radius: '{rounded.sm}'
  sidebar:
    background: '{colors.surface-raised}'
    border: '1px solid {colors.border-hairline}'
---

## Brand & Style

Bookable is a white-label restaurant booking platform for small independent restaurants in the UK. The design language is warm minimal — quiet confidence, earthy tones, generous whitespace. No chrome for chrome's sake. Every element earns its place.

The widget is fully white-labeled: restaurants override primary and secondary colors to match their own brand. The dashboard uses the platform's neutral palette. The aesthetic borrows from Airbnb's clean booking flow: minimal chrome, smooth step transitions, clear CTAs, trust signals.

Dark mode is supported from day one. The palette inverts cleanly — warm linen becomes deep ink, sage green brightens for contrast on dark surfaces.

## Colors

Restrained on purpose. The platform palette is neutral and warm; restaurants bring their own color through white-label overrides.

**Light Mode:**

- **Warm Linen (`#F5F0EB`)** is the primary canvas. Slightly warm, never clinical. The page background.
- **White (`#FFFFFF`)** is the raised surface — cards, modals, inputs. Distinguished from linen by tone and a single hairline border.
- **Ink (`#1A1A1A`)** is the primary text and the primary button fill. High contrast on linen. CTAs are black — impossible to miss.
- **Muted (`#6B6B6B`)** is secondary text, labels, and placeholders. Never used for essential information.
- **Sage (`#8FA67A`)** is the only chromatic color in the platform palette. Used for success states, the secondary button, active nav indicators, and tags. Restaurants override this with their own secondary color in the widget.
- **Hairline (`#E5E0DB`)** separates surfaces at the lowest possible contrast. Anything heavier feels like UI rather than paper.
- **Error Red (`#C44B4B`)** for destructive actions and error states. Used sparingly.

**Dark Mode:**

- **Deep Ink (`#1A1A1A`)** is the dark canvas. Same hex as light-mode primary text — the palette inverts.
- **Dark Surface (`#252320`)** is the raised surface in dark mode. Warm-toned, not pure black.
- **Linen (`#F5F0EB`)** becomes the primary text color in dark mode.
- **Bright Sage (`#A8C48A`)** is the accent in dark mode — brighter to maintain contrast on dark surfaces.
- **Dark Hairline (`#3A3632`)** separates surfaces.

Avoid: gradients, saturated accent fills behind text, more than two chromatic colors, pure black (`#000000`) or pure white (`#FFFFFF`) in dark mode.

## Typography

**Inter** (or system font stack). Clean, modern, highly readable at all sizes.

- **Headings** — `700` weight, `-0.01em` letter-spacing. Used sparingly: page titles, step headers, confirmation headlines.
- **Body** — `400` weight. Default for all content text, form labels, descriptions.
- **Meta** — `500` weight. Used for timestamps, badges, secondary labels, navigation items.

No display sizes. No all-caps labels. The voice is text-first, not chrome-first.

## Layout & Spacing

Scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 px. The largest gaps land between major sections; the smallest sit between tightly related elements.

**Widget:** Fixed width, min 375px (phone), responsive wider. Single-column. Centered in host page container.

**Dashboard:** Sidebar nav on left (240px), main content area fills remaining width. Single-column content within main area.

**Onboarding:** Centered card layout, max-width 480px. Steps advance within the card.

## Elevation & Depth

Subtle. Cards and raised surfaces sit on `{colors.surface-raised}`, distinguished from `{colors.surface-base}` by tone and a hairline border. One level of shadow on cards: `0 1px 3px rgba(0,0,0,0.04)` — barely visible, just enough to lift.

Modals and overlays add a backdrop dim + slightly stronger shadow. No more than two elevation levels.

## Shapes

`rounded/sm` (8px) for inputs, small buttons, tags. `rounded/md` (12px) for cards, large buttons, the widget container. `rounded/lg` (16px) for modals and the onboarding card.

Nothing fully rounded. No pills, no perfect circles for surfaces. The aesthetic is soft-cornered paper, not iOS-button-pill.

Imagery follows container corners exactly.

## Components

- **Widget container** — `{rounded/md}`, white-labeled with restaurant colors. Min 375px, responsive wider. Shadow-dropped from host page.
- **Step header** — `{ink-primary}` heading, `{ink-secondary}` subtitle. Back button left-aligned, no title centered.
- **Party size selector** — Grid of 8 circular buttons. Selected state: `{accent}` fill, white text.
- **Date calendar** — Minimal month grid. Open days selectable, closed days hidden. Selected: `{accent}` fill.
- **Time slots** — Horizontal scroll of pill-shaped buttons. Selected: `{accent}` fill.
- **Details form** — Stacked inputs with labels above. `{input}` styling. Primary CTA at bottom.
- **Confirmation** — Centered checkmark icon (sage), booking summary, success message.
- **Dashboard sidebar** — `{sidebar}` styling. Nav items with icon + label. Active: `{accent}` left border.
- **Booking row** — Time, party size, name, custom field. Hairline separator. No actions (read-only MVP).
- **Onboarding card** — `{card}` styling, centered. Step content inside, primary CTA at bottom.
- **Color picker** — Hex input + native color swatch. Used in white-label settings.

## Do's and Don'ts

| Do | Don't |
|---|---|
| Black CTAs on white — high contrast, impossible to miss | Colored CTAs in the dashboard (save color for the widget) |
| Hairline dividers at lowest legible contrast | Card shadows, gradient fills, accent fills behind text |
| Generous vertical rhythm in widget steps | Compress to fit more on screen |
| Smooth step transitions (fade or slide) | Jarring instant swaps |
| Restaurant colors override only in widget | Change platform dashboard colors per restaurant |
| Empty states with helpful guidance | Empty states with no guidance |
| Dark mode from day one — design both surfaces | Bolt on dark mode later |
