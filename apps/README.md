# Map and Download apps

This directory contains the source code of the "App" and "Download" apps.

The apps are built using **TypeScript**, **React**, and **Vite**.

## Key Technologies

The project uses several essential libraries and frameworks:

- [React](https://reactjs.org/): Component-based JavaScript library for building user interfaces.
- [Vite](https://vitejs.dev/): Next-generation frontend tooling for faster builds.
- [TypeScript](https://www.typescriptlang.org/): Strongly typed programming language for JavaScript.
- [Leaflet](https://leafletjs.com/): Open-source JavaScript library for interactive maps.
- [React-Leaflet](https://react-leaflet.js.org/): React bindings for Leaflet.
- [TailwindCSS](https://tailwindcss.com/): Utility-first CSS framework for styling.
- [shadcn](https://ui.shadcn.com/): Component library built on Tailwind CSS, simplifying styling and design consistency.
- [Redux](https://redux.js.org/): State management library.
- [Highcharts](https://www.highcharts.com/): Library for data visualization and interactive charts.
- [wordpress/react-i18n](https://github.com/WordPress/gutenberg/blob/d9b726b8451746703cc1b9680487e3726ab4a03f/packages/react-i18n/README.md): Internationalization library for React applications.
- [ReactMotion](https://motion.dev/): Animation library for React.

## Getting Started

The apps are automatically built (and updated) when [running the development
environment](../docs/developing-with-docker-compose.md).

## Directory structure

The project's structure is organized to maintain modularity and readability:

- **`src/components/`**: Reusable UI components.
- **`src/assets/`**: Project-specific images and other media assets.
- **`src/hooks/`**: Custom React hooks for logic reusability.
- **`src/lib/`**: External libraries and modules.
- **`src/services/`**: API and data-fetching Redux services.
- **`src/app/store.ts`**: Redux store configuration.
- **`src/app/hooks.ts`**: Redux hooks configuration.
- **`src/features/`**: Redux slices for state management.
- **`src/types/`**: TypeScript type definitions.
- **`src/utils/`**: Helper functions.
- **`src/context/`**: React context providers.
- **`src/App.css`**: Main stylesheet for the application.
- **`src/App.tsx`**: Root component.
- **`src/Global.css`**: Global styles.
- **`src/main-*.tsx`**: Entry point for the application.

### Redux Toolkit
- **`src/features/**`**: This folder will contain all the slices of the Redux Store. Each feature will have its own folder with the following structure:
  - **`*-slice.ts`**: Redux slice containing the state, reducers, and actions.
  - **`types.ts`**: TypeScript types for the feature.
- **`src/app/store.ts`**: Redux store configuration.
- **`src/app/hooks.ts`**: Redux hooks configuration.
- **`src/services/`**: API and data-fetching Redux services.
