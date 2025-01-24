# Climate Data Map

This project is a Climate Data map application built using **TypeScript**, **React**, and **Vite**. It visualizes climate-related data interactively, leveraging mapping and charting libraries to enhance data representation.

## Key Technologies

The project utilizes several essential libraries and frameworks:

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

## Node Version Management

The project utilizes **nvm** (Node Version Manager) for managing Node.js versions. Using `nvm` ensures compatibility across different environments by locking the required Node version.

1. To install `nvm`, follow the [official installation guide](https://github.com/nvm-sh/nvm).
2. Run the following to switch to the required Node version:
   ```bash
   nvm install
   nvm use
   ```
3. Once the correct Node version is active, proceed with the steps below to run or build the project.

## Getting Started

### Running the Project Locally (Vite internal server only)

1. **Clone the repository**:
   ```bash
   git clone <repository_url>
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```

The project will be available at `http://localhost:3000` (or the specified port).

This project uses multiple entry points so for local development you access the following routes:
- `http://localhost:3000/map` - Map application
- `http://localhost:3000/download` - Download application

### To run this project with WordPress backend (Vite + WordPress):
1. TODO: Add instructions on how to run the project with WordPress backend.

### Building the Project

To create an optimized production build:

```bash
npm run build
```

The production-ready files will be available in the `dist` folder.

There are additional build scripts available:

- **`npm run watch`**: Build the project in watch mode.

## Project Structure

The project's structure is organized to maintain modularity and readability:

- **`public/`**: Public static assets.
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
- **`src/main.tsx`**: Entry point for the application.

### Redux Toolkit
- **`src/features/**`**: This folder will contain all the slices of the Redux Store. Each feature will have its own folder with the following structure:
  - **`*-slice.ts`**: Redux slice containing the state, reducers, and actions.
  - **`types.ts`**: TypeScript types for the feature.
- **`src/app/store.ts`**: Redux store configuration.
- **`src/app/hooks.ts`**: Redux hooks configuration.
- **`src/services/`**: API and data-fetching Redux services.

## API Information

*To be defined*: Include details on API integrations, such as data sources, and any specific instructions for handling WMS (Web Map Service) requests or other APIs utilized in the application.
