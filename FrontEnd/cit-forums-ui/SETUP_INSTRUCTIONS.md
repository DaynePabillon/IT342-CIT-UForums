# Setup Instructions for CIT Forums UI

Follow these steps to set up the frontend application and resolve the TypeScript linter errors:

## 1. Install Dependencies

First, navigate to the frontend project directory:

```bash
cd FrontEnd/cit-forums-ui
```

Install the main dependencies:

```bash
npm install
```

## 2. Install TypeScript Type Definitions

To resolve the TypeScript linter errors about missing modules like React and React Router, install the necessary type definitions:

```bash
npm install --save-dev @types/react @types/react-dom @types/node
```

## 3. Install Axios

For API requests, we're using Axios. Install it to resolve the "Cannot find module 'axios'" errors:

```bash
npm install axios
```

## 4. Create React App Files

The missing React files error can be fixed by creating a React application first, then copying our code into it:

```bash
# Create a new React TypeScript app (in a temporary location)
npx create-react-app temp-app --template typescript

# Copy the node_modules folder and any other missing files
cp -r temp-app/node_modules ./
cp -r temp-app/public ./public

# Remove the temporary app
rm -rf temp-app
```

## 5. Start the Development Server

With all dependencies installed and errors resolved, start the development server:

```bash
npm start
```

The application should now run without TypeScript errors, connecting to the backend API at http://localhost:8080.

## Common Issues and Solutions

### TypeScript JSX Errors

If you still see JSX-related errors, make sure:
- You have React 17+ installed
- Your tsconfig.json has the correct JSX settings
- The TypeScript version is compatible with your React version

### API Connection Issues

If the API doesn't connect:
- Ensure the backend is running at http://localhost:8080
- Check the proxy setting in package.json
- Verify that your API endpoints match those expected by the backend

### Component Errors

If components don't render correctly:
- Make sure all import paths are correct
- Verify that all components are exported properly
- Check for missing CSS files or Bootstrap libraries 