# Frontend Development Template

A production-ready React + TypeScript frontend template built with Vite.

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI library |
| TypeScript | Static type checking |
| Vite 8 | Build tool and dev server (oxc and rolldown) |
| React Router 7 | Client-side routing |
| TanStack Query v5 | Server state management |
| Tailwind CSS 4 | Utility-first styling |
| shadcn/ui + Radix UI | Accessible component primitives |
| Motion + Animate UI | Animations |
| Vitest | Unit testing |
| Biome + Ultracite | Linting and formatting |
| Husky | Git hooks |

## Project Structure

```
src/
├── @types/       # Shared TypeScript type declarations
├── api/          # API layer organized by feature
│   └── [feature]/
│       ├── queries/    # TanStack Query hooks
│       └── mutations/  # TanStack Query mutations
├── components/
│   ├── ui/         # shadcn/ui primitives
│   ├── animate-ui/ # Animated components
│   └── sidebar/    # Sidebar layout components
├── config/       # App-level configuration
├── constants/    # Shared constants
├── contexts/     # React contexts (e.g. theme)
├── hooks/        # Custom React hooks
├── layout/       # Root layout
├── lib/          # Utility functions
├── pages/        # Route-level pages
├── providers/    # App-wide providers
├── routes/       # Route definitions
├── tests/        # Vitest test files
└── utils/        # General-purpose utilities
```

## How to Use

This repository is configured as a GitHub template. To start a new project from it:

1. On the repository page, click **Use this template** > **Create a new repository**
2. Choose a name, visibility, and owner for the new repository
3. Click **Create repository**

Then clone and install dependencies locally:

```bash
git clone <your-new-repository-url>
cd <your-project>
bun install   # recommended
bun dev
```

> **Recommendation:** Use [Bun](https://bun.sh) as the package manager and runtime. It is significantly faster than npm or pnpm for installs and script execution.

