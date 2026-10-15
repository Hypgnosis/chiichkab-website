# Ch'iich' Kaab (Xunán Kab) — Melipona Bee Conservation & Interactive Platform

A modern interactive web platform and educational 3D game dedicated to the conservation, cultural heritage, and ecological wisdom of the Mayan stingless bee (*Melipona beecheii* / *Xunán Kab*).

## Overview

- **Landing & Conservation Portal**: Immersive presentation of ancestral Mayan meliponiculture, medicinal honey protocols, ecological impact, and sanctuary initiatives.
- **Interactive 3D Simulation & Mini-Games**: Built with React Three Fiber and Three.js. Experience hive defense, flight through the Mayan jungle canopy, pollen collection, and guardian jobón management.
- **Micro-Services & Cloud Backend**: Firebase Cloud Functions for server-side generative assets and secure integrations.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **3D Graphics & Physics**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Icons & UI**: Lucide React, Chart.js
- **Serverless Backend**: Firebase Functions (v2) with Gemini API integration

## Project Structure

```text
├── src/
│   ├── App.jsx           # Core game engine, 3D scenes & state coordinator
│   ├── Website.jsx       # Landing page, ecological wisdom & protocols
│   ├── Minigames.jsx     # Mini-games & interactive challenges
│   ├── ProductPage.jsx   # Product & honey catalog
│   ├── index.css         # Styling & Tailwind design system
│   └── main.jsx          # Application entry point
├── public/
│   ├── audio/            # Game audio tracks, cutscenes & ambient soundscapes
│   └── website images/   # Sanctuary & photography assets
├── functions/            # Firebase Cloud Functions (backend services)
└── vite.config.js        # Vite build configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ (Node 20+ recommended)
- npm or pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

## Security & Secrets

API keys (such as `GEMINI_API_KEY`) are managed strictly on the server-side via Firebase Secrets (`firebase secrets:set GEMINI_API_KEY`) and are never exposed to the client bundle.
