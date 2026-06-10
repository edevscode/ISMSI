---
name: ISMSI Community Safety
colors:
  surface: '#fcf9f6'
  surface-dim: '#dcdad7'
  surface-bright: '#fcf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f0'
  surface-container: '#f0edeb'
  surface-container-high: '#eae8e5'
  surface-container-highest: '#e4e2df'
  on-surface: '#1b1c1a'
  on-surface-variant: '#434843'
  inverse-surface: '#30302f'
  inverse-on-surface: '#f3f0ee'
  outline: '#737973'
  outline-variant: '#c3c8c1'
  surface-tint: '#4d6453'
  primary: '#061b0e'
  on-primary: '#ffffff'
  primary-container: '#1b3022'
  on-primary-container: '#819986'
  inverse-primary: '#b4cdb8'
  secondary: '#9b4500'
  on-secondary: '#ffffff'
  secondary-container: '#fc8a40'
  on-secondary-container: '#672c00'
  tertiary: '#111a00'
  on-tertiary: '#ffffff'
  tertiary-container: '#243007'
  on-tertiary-container: '#8a9965'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d0e9d4'
  primary-fixed-dim: '#b4cdb8'
  on-primary-fixed: '#0b2013'
  on-primary-fixed-variant: '#364c3c'
  secondary-fixed: '#ffdbc9'
  secondary-fixed-dim: '#ffb68d'
  on-secondary-fixed: '#331200'
  on-secondary-fixed-variant: '#763300'
  tertiary-fixed: '#d9e9ae'
  tertiary-fixed-dim: '#bdcd94'
  on-tertiary-fixed: '#151f00'
  on-tertiary-fixed-variant: '#3e4c20'
  background: '#fcf9f6'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2df'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin-mobile: 16px
  container-margin-desktop: 40px
  gutter: 16px
---

## Brand & Style

This design system is built to serve as a bridge between high-stakes emergency response and local community engagement. The visual direction follows a **Modern Corporate** aesthetic with a strong emphasis on **Civic Trust**. It balances the urgency of a safety platform with the approachability of a neighborhood portal.

The style avoids the clinical coldness of typical government software by using an earthy, organic palette that feels grounded in the physical environment of the community. Every interaction is designed to feel "emergency-ready"—prioritizing clarity, speed of recognition, and reliable feedback. The interface utilizes a clean, card-based architecture to organize disparate data points (incidents, announcements, and safety metrics) into digestible, actionable modules.

## Colors

The palette is rooted in nature and safety. The primary **Dark Green** provides a sense of authority and stability, while the **Beige** background ensures the UI feels warm and less fatiguing than stark white.

- **Primary (#1B3022):** Used for navigation, headers, and high-level branding to establish authority.
- **Secondary/Accent (#FF8C42):** Specifically reserved for primary actions (Report Incident) and "Pending" states. It provides high visibility against the green without the "high-alert" anxiety of pure red.
- **Tertiary Olive (#4F5D2F):** Used for secondary UI elements, such as active states in navigation or iconography.
- **Neutral Warm Gray (#7D7C7A):** Applied to secondary text, borders, and disabled states.
- **Alert Tones:** "Resolved" uses the Primary Dark Green for a sense of closure. "Critical" uses a deep red (not blue) to indicate immediate danger.

## Typography

**Inter** is the sole typeface for this design system to ensure maximum legibility across all device types, especially during high-stress scenarios where information must be read at a glance.

The hierarchy is structured to prioritize information density and clarity. Headings use tighter letter spacing and heavier weights to feel authoritative. Body text uses a generous line height (1.5x) to improve readability for long-form community updates or incident reports. Labels are occasionally set in uppercase with increased tracking to differentiate them from interactive body text.

## Layout & Spacing

The design system utilizes a **8px linear grid** to maintain vertical rhythm. 

- **Mobile (Default):** A 4-column fluid grid with 16px side margins. Elements are primarily stacked vertically to ensure easy one-handed operation—crucial for users on the move.
- **Desktop:** A 12-column fixed grid with a max-width of 1280px. Content is organized into functional zones: navigation on the left/top, main feed in the center, and emergency stats/contacts on the right.

Spacing between cards should consistently be `16px` (md) to maintain a clean, breathable interface that doesn't feel cluttered despite high information density.

## Elevation & Depth

This design system uses a **Tonal Layering** approach combined with **Ambient Shadows** to create hierarchy without overwhelming the user.

1.  **Background:** The Beige (`#F5F5DC`) surface acts as the base layer.
2.  **Cards (Level 1):** White or slightly off-white surfaces with a subtle, diffused shadow (Offset: 0, 4px; Blur: 12px; Color: `#1B3022` at 5% opacity). This creates a "lifted" effect that defines the card boundaries.
3.  **Active/Floating (Level 2):** Critical alerts or floating action buttons (FABs) use a more pronounced shadow (Offset: 0, 8px; Blur: 24px; Color: `#1B3022` at 10% opacity) to signal they are at the top of the stack.

No heavy borders or pure black shadows are used; depth is always soft and natural.

## Shapes

The shape language is defined by **Softness and Approachability**. While the content is serious, the UI elements use rounded corners to feel modern and "human-centric."

- **Standard Elements:** Buttons, input fields, and small UI components use a `8px` (rounded-md) corner radius.
- **Containers/Cards:** Content cards use a `16px` (rounded-xl) radius to clearly encapsulate information and provide a friendly, modern feel.
- **Status Badges:** Use a fully rounded "pill" shape to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Soft Orange (`#FF8C42`) background with white text. Used for "Report Incident" or "Submit."
- **Secondary:** Dark Green (`#1B3022`) outline with Dark Green text. Used for "View Details" or "Cancel."
- **Emergency FAB:** On mobile, a floating Soft Orange button sits at the bottom right for immediate incident reporting.

### Status Badges
Badges are used to communicate the state of an incident:
- **Critical:** Red background, white text, bold weight.
- **Pending:** Soft Orange background, white text.
- **Resolved:** Dark Green background, white text.

### Cards
Cards are the primary container. They must include a `16px` internal padding. Headers within cards should use the `title-lg` typography style. If a card is "Critical," it may include a 4px left-border accent in the status color.

### Input Fields
Fields use a white background with a 1px border of Warm Gray (`#7D7C7A`). Upon focus, the border thickens and changes to Olive Green (`#4F5D2F`). Labels always sit above the field in `label-md` style.

### Lists
Lists for community announcements should have a subtle divider in Warm Gray at 20% opacity. Each list item should have a minimum tap target height of `48px` for mobile accessibility.