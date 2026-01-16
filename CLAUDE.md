# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vue 3 fitness workout tracker for logging Lifetime Gym Alpha class exercises. Data persists locally in browser localStorage.

## Development Commands

```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Build for production (output: dist/)
npm run preview  # Preview production build locally
npm run deploy   # Build and deploy to GitHub Pages
```

No test or lint commands configured.

## Architecture

**Tech Stack:** Vue 3 + Vite, Composition API with `<script setup>`, vanilla CSS (scoped), localStorage for persistence.

**Key Files:**
- `src/composables/useWorkouts.js` - Core data management (CRUD operations, import/export, localStorage sync)
- `src/App.vue` - Root component with tab navigation (Form/History views)
- `src/components/WorkoutForm.vue` - Multi-exercise form with autocomplete
- `src/components/WorkoutHistory.vue` - Collapsible cards, search, edit modal, JSON export

**Data Model:**
```javascript
{
  id: "unique-id",
  date: "YYYY-MM-DD",
  exercises: [{ name, weight, sets, reps, notes }]
}
```

## Patterns

- Reactive state via `ref()` and `computed()`
- Auto-save using `watch()` with `deep: true`
- No external state management (Vuex/Pinia)
- CSS Grid for forms, Flexbox for layouts
- Mobile-responsive (768px breakpoint)

## Deployment

GitHub Pages at `/workouts/` path. Base path configured in `vite.config.js` (production: `/workouts/`, dev: `/`).
