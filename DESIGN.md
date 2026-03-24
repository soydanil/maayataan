# DESIGN.md — maayataan

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#B85C38` | Terracotta — CTAs, active states, links |
| `--color-secondary` | `#2D6A4F` | Jade — success states, secondary actions |
| `--color-bg` | `#FAF3E8` | Limestone — page background |
| `--color-text` | `#1A1A1A` | Primary text |
| `--color-muted` | `#8B7355` | Secondary text, placeholders, captions |
| `--color-error` | `#C0392B` | Error states |
| `--color-border` | `#D4C5A9` | Borders, dividers |

## Typography

- **Font stack:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- **Base size:** 16px mobile / 18px desktop
- **Scale:** 1.25 (Major Third)
- **Headings:** Bold weight, `--color-text`
- **Body:** Regular weight, `--color-text`
- **Captions/labels:** `--color-muted`, smaller size

## Spacing

- **Base unit:** 4px
- **Scale:** 4, 8, 16, 24, 32, 48, 64
- **Component padding:** 16px default
- **Section spacing:** 48px mobile / 64px desktop

## Components

- **Border radius:** 4px (subtle, not bubbly)
- **Shadows:** None by default — use border or background contrast for separation
- **Touch targets:** 44px minimum height/width
- **Buttons:** Solid fill for primary (`--color-primary` bg, white text), outline for secondary
- **Form inputs:** 1px `--color-border`, 4px radius, 16px padding
- **Cards:** Only when card IS the interaction (browse results). 1px border, no shadow.

## Bilingual Pattern

- Maya text first, Spanish below
- Maya in slightly larger or bolder weight to establish hierarchy
- Language labels subtle (`--color-muted`, small caps)

## Anti-Patterns (do NOT use)

- Purple/violet/indigo gradients
- 3-column icon-in-circle feature grids
- Centered everything
- Decorative blobs, wavy SVG dividers
- Emoji as design elements
- Generic hero copy ("Welcome to...", "Unlock the power of...")
- Cookie-cutter section rhythm
