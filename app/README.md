# Escher Liquid Staking App

> A modular Next.js + TypeScript frontend for Escher Finance's liquid staking applications and related DeFi utilities.

This repository contains a Next.js 15 project that utilizes several services and API routes for liquid staking, bridges, liquidity pool, points, and lucky draw.

**Status:** Active development (branch: `main`).

---

## Key Features

- **Liquid Staking** — Stake assets and earn rewards through Babylon and Union protocol integration.
- **Liquidity Pool** — Add, remove, and claim rewards from liquidity pools.
- **Bridge** — Cross-chain asset bridging between Cosmos and EVM networks.
- **Swap** — Token swaps powered by Uniswap and Osmosis integrations.
- **EPoints** — Earn points through platform activities and interactions.
- **Lucky Draw** — Participate in randomized reward draws.

## Tech Stack

- Next.js 15 + React 19
- TypeScript
- Tailwind CSS
- EVM tooling: `wagmi`, `viem`
- Cosmos tooling: `@cosmjs/*`, `cosmos-kit`, `osmojs`
- Data fetching: `@tanstack/react-query`

## Repository Layout (high level)

- `app/` — Next.js application and API routes (uses app-router). Contains multiple sub-apps in `app/apps/`.
- `components/` — Shared UI components and layout pieces.
- `hooks/` — React hooks used across apps.
- `lib/` — Utilities, helpers, and protocol-specific logic.
- `configs/` — Application and chain configuration files.
- `query/`, `resources/`, `types/` — Query helpers, static resources, and TypeScript types.
- `public/` — Static assets (icons, images).

## Getting Started

Prerequisites

- Node.js (recommended: 18.x or newer)
- Yarn 1.x (project uses `yarn@1.22.19` as `packageManager`)

Install

```bash
yarn install
```

Running in development

```bash
yarn dev
```

Secure
```bash
yarn dev --experimental-https
```

This starts the Next.js dev server with Turbopack: it serves the multi-app site at `http://localhost:3000` by default.

Build and start (production)

```bash
yarn build
yarn start
```

Linting and type checking

```bash
yarn lint
yarn lint:fix
yarn type-check
```

Continuous integration helper (runs lint, type-check, and build):

```bash
yarn ci
```

## Environment & Configuration

- The repository expects environment variables for services like Supabase, RPC endpoints, wallet providers, and API keys. Create a local `.env.local` in the project root or copy file `example.env.local` and rename it `env.local`, then set those values as needed for the apps you run.
- Chain / protocol specific settings are available in `configs/` and `lib/`.

## Important Files & Places to Edit

- `app/layout.tsx` — Root layout and global providers.
- `app/page.tsx` and `app/apps/*/` — Application entry points.
- `app/api/` — API route implementations used by the frontend.
- `components/` — Reusable UI pieces and global components.
- `hooks/` — Data-layer and wallet integration hooks.
- `configs/` & `lib/` — Protocol settings and helper functions.

## Development Notes

- The workspace contains multiple sub-apps and feature folders; when adding features, prefer placing UI in `components/` and logic in `hooks/` or `lib/` to keep apps lightweight.
- Keep types in `types/` and share them across apps where applicable.
- When adding new API routes, follow the patterns present in `app/api/` (route handlers and subfolders for resource grouping).

## Contributing

- Create feature branches from `main` (or the canonical branch used by the project maintainers).
- Open a PR with a descriptive title and link any relevant issue.
- Run `yarn lint` and `yarn type-check` before submitting.

## License

See the `LICENSE` file for details.

## Contact

For questions and coordination, contact the Escher Finance engineering team or open an issue in this repository.