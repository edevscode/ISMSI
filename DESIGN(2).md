---
name: ISMSI Command Center
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1c1c'
  surface-container: '#1f2020'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e4e2e1'
  on-surface-variant: '#c3c8c1'
  inverse-surface: '#e4e2e1'
  inverse-on-surface: '#303030'
  outline: '#8d928c'
  outline-variant: '#434843'
  surface-tint: '#b4cdb8'
  primary: '#b4cdb8'
  on-primary: '#203527'
  primary-container: '#1b3022'
  on-primary-container: '#819986'
  inverse-primary: '#4d6453'
  secondary: '#c3cc8c'
  on-secondary: '#2d3404'
  secondary-container: '#434b18'
  on-secondary-container: '#b1bb7c'
  tertiary: '#c8c8b0'
  on-tertiary: '#303221'
  tertiary-container: '#2b2d1d'
  on-tertiary-container: '#93947f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d0e9d4'
  primary-fixed-dim: '#b4cdb8'
  on-primary-fixed: '#0b2013'
  on-primary-fixed-variant: '#364c3c'
  secondary-fixed: '#dfe8a6'
  secondary-fixed-dim: '#c3cc8c'
  on-secondary-fixed: '#191e00'
  on-secondary-fixed-variant: '#434b18'
  tertiary-fixed: '#e4e4cc'
  tertiary-fixed-dim: '#c8c8b0'
  on-tertiary-fixed: '#1b1d0e'
  on-tertiary-fixed-variant: '#474836'
  background: '#131313'
  on-background: '#e4e2e1'
  surface-variant: '#353535'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  sidebar_width: 360px
  header_height: 64px
  panel_padding: 12px
---

## Brand & Style
The design system is engineered for high-stakes municipal oversight and emergency management. It projects an aura of stability, authority, and rapid situational awareness. The aesthetic is **Modern Corporate/Government-Tech** with a specific focus on a "Command Center" interface—prioritizing data density and legibility without inducing cognitive overload.

The target audience consists of dispatchers, city officials, and emergency coordinators who require a "single pane of glass" view. The UI leverages a dark-mode-first approach for the map interface to reduce eye strain during long shifts, while using structured, semi-transparent panels to maintain a clean, organized hierarchy.

**Design Principles:**
- **Functional Density:** Maximize information visibility by using compact components and efficient spacing.
- **Urgency Tiering:** Use color strictly for state and status; neutral tones handle everything else.
- **Map-Centricity:** The UI acts as an overlay to geospatial data, ensuring the map remains the primary source of truth.

## Colors
The palette is rooted in a "Tactical Forest" scheme, moving away from standard "tech blue" to establish a unique identity for the ISMSI ecosystem. 

- **Primary (Forest Green):** Used for primary navigation, active headers, and main brand elements.
- **Secondary (Olive Green):** Reserved for secondary actions, map filters, and grouping indicators.
- **Warm Beige:** Acts as the primary "light" accent for high-contrast text on dark backgrounds and key callouts.
- **Charcoal Gray:** The foundation for containers, borders, and input fields.
- **Alerts:** Red and Orange are used exclusively for system-level warnings and critical incident markers on the map. 

**Note:** Blue is strictly prohibited to avoid confusion with traditional civilian tech or competing agency branding.

## Typography
The typography system utilizes **Inter** for its exceptional legibility and neutral, professional tone. To support the command center aesthetic, **JetBrains Mono** is introduced for data points, coordinates, and timestamps, providing a technical, precise feel.

- **Headlines:** Set in Inter with tight letter spacing for a modern, authoritative look.
- **Data Display:** All numerical values, IDs, and status labels use JetBrains Mono to ensure characters are distinct (e.g., distinguishing '0' from 'O').
- **Labels:** Small, all-caps labels are used for metadata to maximize vertical space in sidebars.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model optimized for ultra-wide and standard desktop monitors. 

- **Primary Framework:** A fixed left navigation rail (minimized) and a fixed-width right information panel (360px) bracket a fluid central map viewport.
- **Information Density:** A 4px baseline grid is used to allow for "compact" UI variations. 12px is the standard padding for internal container elements to maintain high data density without clutter.
- **Overlays:** Modals and flyouts use "Safe Areas" to ensure they do not obscure the center-point of the map during active incidents.

## Elevation & Depth
This design system utilizes **Tonal Layers** combined with **Glassmorphism** to create a sense of focused depth over the map.

- **Base Layer:** The Map (lowest elevation).
- **Surface Layer:** Semi-transparent Charcoal Gray (`#333333` at 85% opacity) with a 12px backdrop blur. This allows the map's movement to be sensed behind UI panels.
- **Raised Layer:** Solid Forest Green elements or active cards.
- **Shadows:** Avoid soft, large-radius shadows. Use crisp, 1px borders in Olive Green or translucent Beige to define edges. If a shadow is necessary, use a "Hard Shadow" (4px offset, 0 blur) to maintain the technical, brutalist-lite aesthetic.

## Shapes
The shape language is **Soft-Geometric**. A subtle 4px (`0.25rem`) corner radius is applied to standard components like buttons and input fields to maintain a professional, systematic appearance.

- **Interactive Elements:** 4px radius (Soft).
- **Status Chips:** Full pill-shape for high visibility and contrast against rectangular data rows.
- **Map Markers:** Diamond or Hexagonal shapes are preferred over circles to differentiate "Command Center" markers from standard consumer map pins.

## Components
- **Buttons:** Primary buttons use Forest Green with Warm Beige text. Secondary buttons use an Olive Green outline. States (Hover/Active) should involve a brightness shift rather than a color change.
- **Data Cards:** High-density layout with 1px borders. Use "Data-Mono" typography for values and "Label-Caps" for headings.
- **Incident Chips:** Compact indicators with a solid color block on the left (Red/Orange) and the incident ID/Time on the right.
- **Input Fields:** Dark background (Charcoal) with a 1px Olive Green border. On focus, the border shifts to Warm Beige.
- **Map Controls:** Grouped in the bottom-right or top-right. Minimalist icons on semi-transparent square backgrounds.
- **Status Indicators:** Use "Pulsing" animations for Critical (Red) alerts to draw immediate attention within the peripheral vision.