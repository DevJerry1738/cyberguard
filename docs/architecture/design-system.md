# UI/UX Design System Guide

This document defines the interface architecture, style guidelines, and dark-mode themes for CyberGuard.

---

## 1. Visual Tokens

### 1.1. Color Palette
We use a premium, dark-mode default palette tailored for cybersecurity applications:
- **Background (Slate-950)**: `#020617` (Deep navy/black base).
- **Surface (Slate-900)**: `#0f172a` (Card backgrounds, header sections).
- **Accent (Sky-500)**: `#0ea5e9` (Core action buttons, active borders, compliance indicators).
- **Critical (Rose-500)**: `#f43f5e` (High severity threat level markers, risk errors).
- **Success (Emerald-500)**: `#10b981` (Passing checks, resolved security items).

### 1.2. Typography
- **Primary Font**: `Inter` (sans-serif) for high legibility on text tables.
- **Header Font**: `Outfit` (sans-serif) to provide clean, rounded modern headlines.

---

## 2. Component Blueprint Specifications

### 2.1. Metric Cards
Cards are used to list compliance indicators.
- **CSS Styling Class**:
  `bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-sky-500/20 transition-all duration-300`
- **Interactions**: Subtle scaling hover transition.

### 2.2. Interactive Buttons
- **Primary Buttons**:
  `bg-sky-500 hover:bg-sky-600 text-white font-medium px-4 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-sky-500/40`
- **Secondary Buttons**:
  `bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium px-4 py-2 rounded-lg transition-colors`

---

## 3. Accessibility & Dark Mode Strategies
- **Contrast**: Text elements must satisfy WCAG 2.1 Level AA minimum contrast ratio (4.5:1).
- **Focus Indicators**: Focusable controls must display a high-contrast ring (`focus:ring-2 focus:ring-sky-500`) to aid keyboard navigators.
- **Dark Mode**: CyberGuard uses a dark-first theme. If light mode is added (optional future roadmaps), variables map using Tailwind custom color classes (`var(--background)`).
