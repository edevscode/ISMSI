---
name: Field Responder Extension
colors:
  surface: '#faf9f4'
  surface-dim: '#dbdad5'
  surface-bright: '#faf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f4ef'
  surface-container: '#efeee9'
  surface-container-high: '#e9e8e3'
  surface-container-highest: '#e3e3de'
  on-surface: '#1b1c19'
  on-surface-variant: '#434843'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ec'
  outline: '#737973'
  outline-variant: '#c3c8c1'
  surface-tint: '#4d6453'
  primary: '#061b0e'
  on-primary: '#ffffff'
  primary-container: '#1b3022'
  on-primary-container: '#819986'
  inverse-primary: '#b4cdb8'
  secondary: '#64602c'
  on-secondary: '#ffffff'
  secondary-container: '#e9e2a1'
  on-secondary-container: '#696430'
  tertiary: '#380001'
  on-tertiary: '#ffffff'
  tertiary-container: '#5f0004'
  on-tertiary-container: '#ff594e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d0e9d4'
  primary-fixed-dim: '#b4cdb8'
  on-primary-fixed: '#0b2013'
  on-primary-fixed-variant: '#364c3c'
  secondary-fixed: '#ece5a4'
  secondary-fixed-dim: '#cfc98a'
  on-secondary-fixed: '#1f1c00'
  on-secondary-fixed-variant: '#4c4817'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb4ab'
  on-tertiary-fixed: '#410002'
  on-tertiary-fixed-variant: '#93000b'
  background: '#faf9f4'
  on-background: '#1b1c19'
  surface-variant: '#e3e3de'
typography:
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 26px
    fontWeight: '800'
    lineHeight: 32px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 16px
  margin-mobile: 16px
  margin-tablet: 32px
  touch-target-min: 48px
  stack-gap: 12px
---

## Brand & Style

The design system for the Field Responder extension is built for high-stakes, outdoor environments where legibility and speed of interaction are paramount. It evolves the core brand identity into a **Mission-Focused / Utilitarian** aesthetic. The personality is authoritative, reliable, and "ruggedized"—prioritizing functional clarity over decorative flourish.

The UI targets responders operating in variable lighting conditions, often using one hand while wearing gloves or moving. The visual language utilizes heavy-duty structural elements, crisp borders, and a high-contrast palette to ensure the interface remains discernible under direct sunlight or in low-light emergency scenarios.

## Colors

This palette is engineered for maximum environmental contrast. 

- **Forest Green (#1B3022):** The primary anchor. Used for headers, primary actions, and structural grounding.
- **Olive (#8B864E):** Used for secondary information and distinct functional groupings, maintaining the organic heritage of the brand.
- **Warm White (#F9F8F3):** The primary background color, chosen to reduce glare compared to pure white while maintaining high contrast for dark text.
- **Critical Red (#B91C1C) & Warning Orange (#EA580C):** These are reserved strictly for alerts, emergency statuses, and destructive actions. They must pop aggressively against the green and neutral tones.

## Typography

The typography system prioritizes immediate data recognition. **Hanken Grotesk** provides a sharp, contemporary feel with high x-heights for readability. **JetBrains Mono** is introduced for labels, timestamps, and technical data points to provide a distinct "instrumentation" feel that separates metadata from primary content.

All weights are shifted toward the heavier end of the spectrum (Medium to ExtraBold) to ensure characters do not "wash out" in bright outdoor light. Letter spacing is slightly tightened for headlines to create a compact, impactful look, while labels use expanded tracking for clarity at small sizes.

## Layout & Spacing

The layout utilizes a **fluid grid** optimized for mobile-first field use. A 4-column grid is used for mobile, scaling to 8 columns for tablets. 

The "Zone of Operation" philosophy dictates the layout: critical actions (Start Incident, Call Dispatch) are placed in the bottom third of the screen to facilitate one-handed thumb operation. Information is stacked vertically in high-contrast blocks to prevent horizontal eye fatigue. Gutters are kept tight (16px) to maximize the "surface area" of interactive elements.

## Elevation & Depth

To maintain the rugged, mission-focused aesthetic, this design system avoids soft shadows and transparency. Depth is communicated through **Tonal Layering** and **High-Contrast Outlines**:

- **Primary Surface:** Warm White (#F9F8F3).
- **Raised Elements:** Use a 2px solid border in Forest Green or Olive rather than a shadow.
- **Active State:** Elements "press" into the screen using a darker inner stroke or a solid color fill change.
- **Overlay/Modals:** Use a solid 4px border with a high-contrast backdrop (Forest Green at 80% opacity) to ensure the focus is absolute.

## Shapes

The shape language is **Soft (0.25rem)**, bordering on sharp. This minimal rounding provides a precision-engineered look that feels more durable and "professional tool-like" than fully rounded consumer apps. 

Standard components use a 4px radius. Larger containers (cards) use an 8px radius (rounded-lg). This subtle curvature prevents the UI from feeling "sharp" or hostile while maintaining the disciplined, rectangular structure required for high-density data display.

## Components

### Buttons
Buttons are oversized (minimum height 56px) for easy tapping. 
- **Primary:** Forest Green background, Warm White text, Bold weight.
- **Emergency:** Critical Red background, white text.
- **Secondary:** Olive border (2px), transparent background, Olive text.

### Status Badges
High-visibility markers for incident status. Badges use all-caps JetBrains Mono.
- **Active:** Solid Forest Green.
- **Critical:** Pulsing Critical Red.
- **Pending:** Solid Olive.

### Input Fields
Field inputs feature a 2px Forest Green bottom border and a light Olive tint on the background to make the hit area undeniable. Labels always float above the input to maintain visibility during typing.

### Cards
Cards are the primary container for incident data. They feature a 1px Olive border and no shadow. The header of the card is often color-coded to the status of the item within.

### One-Handed Navigation
A bottom-anchored "Action Bar" replaces traditional top navigation, housing the three most critical field tools (Map, Reports, Emergency) within easy reach of the thumb.