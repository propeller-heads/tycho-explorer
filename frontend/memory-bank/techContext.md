# Tech Context: Pool Explorer

## Frontend Stack

Based on `package.json` and `vite.config.ts`:

*   **Framework**: React (v18.3.1)
*   **Language**: TypeScript (v5.5.3)
*   **Build Tool**: Vite (using `rolldown-vite` preset)
*   **Styling**:
    *   Tailwind CSS (v3.4.11)
    *   `tailwindcss-animate`
    *   `clsx` and `tailwind-merge` for utility class management.
*   **UI Components**:
    *   Shadcn/ui (indicated by `components.json` and various `@radix-ui/*` dependencies)
    *   Lucide React for icons.
*   **Routing**: React Router DOM (v7.5.2)
*   **State Management**: React Context API (implied by `PoolDataContext.tsx`)
*   **Forms**: React Hook Form (v7.53.0) with Zod resolver (`@hookform/resolvers`)
*   **Data Visualization**:
    *   Recharts (v2.12.7) - Likely for charts/graphs.
    *   `vis-network` and `vis-data` (v9.1.9, v7.1.9) - Specifically for network graph visualizations.
*   **Linting/Formatting**:
    *   ESLint (v9.9.0)
    *   TypeScript ESLint (v8.0.1)
*   **Path Aliases**:
    *   `@`: `src/`
    *   `@te`: `src/components/dexscan/` (as per `vite.config.ts`)

## Development Environment

*   **Package Manager**: Implied by `package.json` (likely npm or yarn, bun.lockb suggests bun).
*   **Development Server**: `vite dev` (runs on `localhost:8080` by default as per `vite.config.ts`).
*   **Build Commands**:
    *   `vite build` (production build)
    *   `vite build --mode development` (development build)
*   **Linting Command**: `eslint .`

## Key Dependencies and Libraries

*   **`@radix-ui/*`**: Core for Shadcn/ui components (Accordion, Dialog, Dropdown, Select, Tooltip, etc.).
*   **`lucide-react`**: Icon library.
*   **`class-variance-authority`**: For creating flexible UI component variants.
*   **`date-fns`**: For date formatting/manipulation.
*   **`cmdk`**: Command menu component.
*   **`embla-carousel-react`**: Carousel component.
*   **`input-otp`**: One-time password input component.
*   **`next-themes`**: Theme management (light/dark mode).
*   **`react-resizable-panels`**: For creating resizable panel layouts.
*   **`vaul`**: Drawer component.

## Backend/Data Source

*   **WebSocket**: The application connects to a WebSocket for real-time pool data updates, as seen in `WebSocketConfig.tsx` and `PoolDataContext.tsx`.
    *   The WebSocket URL is configurable.
    *   Chain selection is available (currently defaulting to Ethereum).
*   **Tycho**: The specification mentions building "an uncompromising UI on Tycho" and using "Tycho Simulation". This suggests Tycho is the underlying data source or simulation engine, likely accessed via the WebSocket.

## Coding Conventions & Custom Rules (.clinerules)

*   Abstract repeated CSS classes into strings.
*   No magic strings: always name strings and reuse them.
*   Aim for small functions (ideally < 20 lines).
*   Aim for small files (ideally < 200 lines).
*   Write a line of comment above each concept when editing or adding code.
*   Do not implement for accessibility features (e.g., alt tags).
*   Follow a specific function design process:
    1.  Problem Analysis to Data Definitions
    2.  Signature, Purpose Statement, Header
    3.  Functional Examples
    4.  Function Template
    5.  Function Definition
    6.  Testing (only if asked)
*   Keep components and code modular, reducing dependencies.

## Source Files

This technical context is derived from:
*   `package.json`
*   `vite.config.ts`
*   `.clinerules`
*   Exploration of `src/components/dexscan/` directory structure and file contents.
*   `docs/specification.md` (for references to Tycho and data sources).
