# Design

## Anchor: Swiss

**Why:** Government-service-portal clarity demands clean information hierarchy, white/neutral surfaces, and grid-based structure. Swiss design is the natural fit - it's the language of official forms and public service portals, which aligns with the calm, professional tone required.

**Differentiator:** Data-first clarity layout - information density without clutter, using the grid as the primary structural device with clear visual hierarchy. Content organized in predictable card-based sections with ample whitespace.

## Tokens

**Surface:** Pure white `#FFFFFF`, neutral `#F7F7F8` for card backgrounds
**Typography:** System sans-serif stack (system-ui, -apple-system, Segoe UI, Roboto) - clean, readable, fast
**Accent:** Yves Klein Blue `#002FA7` - professional, calm, authoritative
**Signal colors:** Green `#1B8C3E` for online/synced, Red `#C62828` for offline/pending, Amber `#E65100` for warnings
**Structure:** Visible 8px grid system, 1px hairline rules for separation, left-aligned typography
**Shadows:** Soft, subtle - 0 1px 3px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)

## Layout

**App shell:** Collapsible sidebar navigation, main content area
- Sidebar width: 240px expanded, 64px collapsed
- Top bar: app title, connection status, user menu
- Content: max-width 1200px, centered, 24px padding

**Navigation:** Dashboard, Activities, Plans, Sync Queue, Kits, Settings
**Touch targets:** Minimum 44px height, 8px spacing between interactive elements
**Typography:** Base 16px, line-height 1.5, headings 20-28px bold

## Components

**Cards:** White background, 8px border radius, subtle shadow, 16px padding
**Buttons:** Primary (filled accent color), Secondary (outline), Tertiary (text-only)
**Inputs:** Clear labels, 40px height, 1px border, focus ring with 2px accent outline
**Status badges:** Non-color cues with icons - 🟢 Online, 🔴 Offline, ✅ Synced, ⚠ Pending

## States

- Empty: "No activities saved yet" with guidance
- Loading: Skeleton placeholders
- Error: Recovery guidance with retry action
- Offline: Disabled sync, queue indicator

## Accessibility

- WCAG 2.2 AA target
- 4.5:1 minimum contrast ratio
- Full keyboard navigation
- Visible focus indicators
- Skip link to main content
- ARIA live regions for status updates