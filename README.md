# SHIP-3D-SITE

![Github actions build status](https://github.com/sic-quod-tsavorite/ship-3d-site/actions/workflows/main.yaml/badge.svg)

This is the Vue 3 frontend for the [API-SHIP-3D](https://github.com/sic-quod-tsavorite/api-ship-3d) project. It provides an interactive web interface for browsing and managing maritime vessel information with real-time 3D visualization. Built with strict TypeScript and modern Vue 3 composition API, the application features a responsive design powered by Tailwind CSS and 3D rendering capabilities via Three.js.

### Key Features

- 3D vessel visualization with Three.js
- User authentication with JWT (cookie-based)
- Vessel management (CRUD operations)
- Responsive design with Tailwind CSS
- Type-safe development with strict TypeScript

## Technologies Used

**Runtime & Framework:**
- Node.js
- Vue 3
- Vite (build tool)
- TypeScript (strict mode)

**UI & Styling:**
- Tailwind CSS
- Heroicons Vue for UI icons
- Vue Router for navigation

**State Management & Composition:**
- Pinia for global state
- Composition API

**3D Graphics:**
- Three.js for 3D visualization

**Validation & Testing:**
- Vitest for unit testing
- ESLint + Prettier for code quality

**Documentation:**
- External tool docs: [Tailwind CSS](https://tailwindcss.com/docs/installation/using-vite), [Heroicons](https://heroicons.com/), [Three.js](https://threejs.org/docs/), [Vite](https://vite.dev/guide/), [Vue 3](https://v3.vuejs.org/guide/introduction.html)

## Recommended

Use Visual Studio Code with recommended plugins from ".vscode" directory. Or an IDE with similar capabilities and plugins.

## How to Run

### Install Dependencies

Using your preferred package manager:

```bash
npm install
# or
bun install
# or
pnpm install
# or
yarn install
```

### Environment Variables

Create a `.env` file in the root of the project with the following variables:

```Environment Variables
VITE_API_URL=https://example.api/api-ship-3d
VITE_BACKEND=https://example.api
VITE_LAUNCH_EDITOR=customCodeEditor
VITE_PATH=/assets/models/
VITE_ROUTER_PREFIX=/prefix

# Some text is currently hidden and will need these variables filled out to display content.
VITE_COMPANY1_NAME=Company Name
VITE_COMPANY1_URL=https://company-url.com/
VITE_COMPANY1_LOGO=/assets/logos/logo.png
VITE_COMPANY2_NAME=Company Name 2
VITE_COMPANY2_URL=https://company2-url.com/
VITE_COMPANY2_LOGO=/assets/logos/logo2.png
VITE_COMPANY3_NAME=Company Name 3
VITE_COMPANY3_URL=https://company3-url.com/
VITE_COMPANY3_LOGO=/assets/logos/logo3.png
VITE_ABOUT_US=Company description text here
```

**Variables:**
- `VITE_API_URL`: Backend API endpoint
- `VITE_BACKEND`: Backend API root endpoint used in vite.config.ts (will default to "http://localhost:4000" if not specified)
- `VITE_LAUNCH_EDITOR`: If you want to change code editor used with vue devtools (will default to vs code if not specified)
- `VITE_PATH`: Path to 3D model assets
- `VITE_ROUTER_PREFIX`: Router base path (leave empty for root)
- `VITE_COMPANY*_*`: Company branding and information
- `VITE_ABOUT_US`: Company description text

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Development | `npm run dev` | Start dev server on http://localhost:5173 |
| Build | `npm run build` | Production build |
| Build Dev | `npm run build-dev` | Build using env with prefix for moove dev environment |
| Preview | `npm run preview` | Preview production build locally |
| Lint | `npm run lint` | Run ESLint with auto-fix |
| Test | `npm run test` | Run Vitest tests with UI |
