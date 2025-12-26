# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 application using the App Router architecture, designed to be a web-based coding environment. The project uses TypeScript, React 19, Tailwind CSS v4, Material-UI (MUI), and Monaco Editor for code editing functionality.

## Technology Stack

- **Framework**: Next.js 16.0.6 with App Router
- **Language**: TypeScript 5
- **UI Libraries**:
  - Material-UI v7.3.5 (@mui/material with Emotion)
  - Tailwind CSS v4 (new PostCSS architecture)
- **Code Editor**: Monaco Editor 0.55.1
- **Fonts**: Geist Sans and Geist Mono (via next/font)

## Commands

### Development
```bash
npm run dev
```
Starts the Next.js development server at http://localhost:3000 with hot reload.

### Build
```bash
npm run build
```
Creates an optimized production build.

### Production Server
```bash
npm start
```
Runs the production server (requires `npm run build` first).

### Linting
```bash
npm run lint
```
Runs ESLint with Next.js configuration (core-web-vitals and TypeScript rules).

## Architecture

### App Router Structure
The project uses Next.js App Router (not Pages Router):
- `app/layout.tsx` - Root layout with Geist font configuration and global styles
- `app/page.tsx` - Home page component
- `app/globals.css` - Global styles with Tailwind CSS v4 imports and CSS custom properties

### Path Aliases
The project uses `@/*` as a path alias mapping to the root directory (configured in tsconfig.json).

### Styling Architecture
- **Tailwind CSS v4**: Uses the new PostCSS-based architecture (`@tailwindcss/postcss` plugin)
- **CSS Custom Properties**: Theme variables defined in `globals.css` using `:root` and `@theme inline`
- **Dark Mode**: Automatic dark mode support via `prefers-color-scheme` media query
- **Emotion**: Used alongside Tailwind for MUI components (@emotion/react and @emotion/styled)

### TypeScript Configuration
- **Target**: ES2017
- **JSX**: Uses `react-jsx` (new JSX transform)
- **Module Resolution**: bundler mode (optimized for modern bundlers)
- **Strict Mode**: Enabled
- **Path Mapping**: `@/*` points to project root

### ESLint Configuration
Uses the new ESLint flat config format (eslint.config.mjs):
- Next.js core-web-vitals rules
- Next.js TypeScript rules
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

## Monaco Editor Integration

The project includes Monaco Editor for code editing capabilities. When working with Monaco:
- Monaco is imported directly (not via a wrapper)
- Consider code splitting to avoid large bundle sizes
- Monaco requires client-side rendering (use `'use client'` directive in components)

## MUI + Tailwind Integration

This project uses both MUI and Tailwind CSS. Be aware of:
- MUI uses Emotion for styling
- Tailwind classes should not conflict with MUI component styles
- Consider using MUI's `sx` prop for component-specific styles alongside Tailwind utilities

## Must follow Instructions
- Always update the progress/claude-progress.md to the progress of the implementation of the project
- After you implement any feature make sure to test the feature using Puppeteer MCP
- After testing is done, ensure that the current state is committed on to git. 
- After each execution leave the project in a complete ready to be merged state, with the feature properly working.
- Strictly do not remove or modify anything in the features_list.json beyond marking the feature as implemented. 