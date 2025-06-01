# FiliUp - File Upload Application

This application provides a modern interface for file uploading, sharing, and management.

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example` with your API URL
4. Start the development server:
   ```
   npm run dev
   ```

## API Services

The application uses a modular API service structure:

- `api.js` - Base axios configuration with interceptors
- `authService.js` - Authentication operations (login, register, etc.)
- `userService.js` - User profile operations
- `fileService.js` - File upload, download, and management

Import services from the services directory:

```javascript
import { authService, fileService, userService } from './services';

// Example usage
const login = async () => {
  try {
    const user = await authService.login({ email, password });
    // Handle successful login
  } catch (error) {
    // Handle error
  }
};
```

## Environment Variables

Create a `.env` file with the following variables:

```
VITE_API_URL=http://localhost:5000/api
```

## Technologies

- React 19
- Vite
- Axios for API calls
- Tailwind CSS
- Material UI components
- React Router v7

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
