# CIT Forums UI

This is the frontend for the CIT Forums application, built with React, TypeScript, and React Router.

## Prerequisites

- Node.js (v14 or newer)
- npm or yarn

## Setup

1. Install dependencies:
```
npm install
```
or
```
yarn
```

2. Install TypeScript type definitions for dependencies:
```
npm install --save-dev @types/react @types/react-dom @types/node
```
or
```
yarn add --dev @types/react @types/react-dom @types/node
```

3. Start the development server:
```
npm start
```
or
```
yarn start
```

## Project Structure

- `/public` - Static files
- `/src` - Source code
  - `/components` - Reusable UI components
  - `/pages` - Page components
  - `/services` - API services
  - `/hooks` - Custom React hooks
  - `/utils` - Utility functions

## Backend Connection

The frontend connects to the backend API at http://localhost:8080. This is configured in the `package.json` file with the `proxy` setting.

## Authentication

User authentication is handled with JWT tokens. When a user logs in, the token is stored in local storage and used for authenticating API requests.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Runs tests
- `npm eject` - Ejects the app from Create React App 