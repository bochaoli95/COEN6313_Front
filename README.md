# AI Resume Enhancer Frontend

A clean and modern Vue 3 frontend application for the AI Resume Enhancer system with ChatGPT-style dark theme UI.

## Features

- ✅ User registration and login
- ✅ Resume upload and management
- ✅ AI chat assistant (resume optimization)
- ✅ Session management
- ✅ Resume file viewing
- ✅ User management

## Tech Stack

- Vue 3 (Composition API)
- Vue Router 4
- Pinia (State Management)
- Axios (HTTP Client)
- Vite (Build Tool)

## Design

- **ChatGPT-style dark theme** with elegant color scheme
- **Dark backgrounds** (#343541, #40414f) similar to ChatGPT
- **Green accent color** (#10a37f) for primary actions
- **Clean UI** with smooth transitions and modern card layouts

## Installation

```bash
# Install dependencies
npm install
```

## Development

```bash
# Start development server
npm run dev
```

Application will run at http://localhost:3000

## Build

```bash
# Build for production
npm run build
```

## Configuration

By default, API requests are proxied to `http://localhost:8006`.

To modify, edit the proxy configuration in `vite.config.js`.

## Project Structure

```
src/
├── main.js           # Application entry point
├── App.vue           # Root component
├── style.css         # Global styles
├── router/           # Route configuration
│   └── index.js
├── stores/           # Pinia state management
│   └── auth.js
├── services/         # API services
│   └── api.js
└── views/            # Page components
    ├── Home.vue
    ├── Login.vue
    ├── Register.vue
    ├── Resumes.vue
    ├── ResumeFiles.vue
    ├── Sessions.vue
    ├── Chat.vue
    └── Users.vue
```

## Pages

- **Home** (`/`) - Application homepage and feature overview
- **Login** (`/login`) - User login
- **Register** (`/register`) - New user registration
- **Resumes** (`/resumes`) - Upload, view and manage resumes
- **Resume Files** (`/resume-files`) - View generated resume files
- **Sessions** (`/sessions`) - Manage chat sessions
- **AI Assistant** (`/chat`) - Chat with AI to optimize resume
- **Users** (`/users`) - View and manage users (requires login)

## Authentication

The application uses Bearer Token authentication. After login, the token is saved in localStorage and automatically added to request headers in subsequent API calls.

