# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + TypeScript + Vite, Tailwind CSS, shadcn/ui, React Router, Context API, custom hooks. Local persistence via localStorage and IndexedDB.

## Users

**Primary**: STEM facilitators working in Namibian schools and community centres. They are on-site with students, need practical lesson materials, and require quick access to activity resources during class time with intermittent internet connectivity.

**Secondary**: Outreach coordinators, volunteer assistants, and equipment custodians who help organize STEM programs across multiple locations.

## Product Purpose

STEMMate Namibia is an offline-first web application that enables STEM facilitators to discover, save, and organize educational activities for Namibian classrooms and communities. It provides tools for creating session plans, managing equipment kit requests, and tracking activity logistics - all while functioning reliably in low-connectivity environments.

Success means facilitators can:
- Find and save relevant activities without internet
- Create structured session plans that survive browser restarts
- Track equipment needs for shared resources
- Work confidently on shared low-spec devices

## Positioning

A government-service-portal style application built for the realities of rural and underserved Namibian schools: no internet dependency, minimal device requirements, and data privacy that respects student privacy.

## Operating Context

- Facilitators work in schools with intermittent/costly internet
- Devices are shared, low-spec tablets or laptops
- Tech support is limited; interfaces must be self-explanatory
- Mixed digital confidence among users
- Session planning happens on-site, often without connectivity

## Capabilities and Constraints

**Capabilities:**
- Browse, search, filter activities by level, duration, topic, materials
- Save activities for offline access with counter indicator
- Create/edit/delete session plans with auto-save and draft recovery
- Reorderable plan steps, safety notes, inclusion prompts, participation counts
- Sync queue for offline plan completion with manual retry
- Kit request management with clash detection
- Data export (JSON) and reset functionality
- Settings: dark mode, font size, high contrast, connection simulation, sign out

**Constraints:**
- No backend - all data stored client-side
- No pupil names, photos, audio, identifiers, or profiles anywhere
- Pausing data minimization principle
- WCAG 2.2 AA accessibility compliance
- 44px+ touch targets, large type, clean cards, soft shadows
- No heavy libraries, animations, or AI-UI patterns

## Brand Commitments

- Plain English tone, calm government-service-portal clarity
- Never store or display pupil data
- Version label v1.0.0 in footer
- Professional, understated visual design

## Evidence on Hand

- User requirements document provided in spec
- No existing codebase or assets
- Synthetic Namibian-context activity data to be created (8+ activities)

## Product Principles

1. Offline-first: The app must be fully usable without any internet connection
2. Data privacy: Students are never users; no pupil data exists anywhere in the system
3. Accessibility: WCAG 2.2 AA compliance for users with diverse abilities and assistive technologies
4. Simplicity: Clean, uncluttered interface that works on low-spec shared devices
5. Reliability: Data persists through refresh and browser restart; sync is resilient

## Accessibility & Inclusion

WCAG 2.2 AA compliance required:
- Full keyboard navigation
- Visible focus indicators
- Skip link to main content
- Proper semantic markup and labelled inputs
- ARIA live regions for status and error announcements
- 100% color contrast ratio of 4.5:1 or better
- Support for 200% zoom and 320px reflow
- Non-color status indicators
- Error boundaries with recovery guidance
- Empty state messaging