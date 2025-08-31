# Overview

This is a full-stack web application built with a React frontend and Express.js backend. The application currently implements a calculator interface as the main feature. The project uses TypeScript throughout and follows a monorepo structure with shared code between client and server.

The application is designed as a modern web app with a clean UI built using shadcn/ui components, proper state management with React Query, and a scalable backend architecture ready for database integration.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and dark theme support
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management
- **Form Handling**: React Hook Form with Zod validation (via @hookform/resolvers)

The frontend follows a component-based architecture with reusable UI components in the `/components/ui` directory. The main application logic is contained in pages, with the calculator being the primary feature.

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Development**: tsx for TypeScript execution during development
- **Build**: esbuild for fast production builds
- **Storage Interface**: Abstract storage layer with in-memory implementation
- **API Design**: RESTful API structure with /api prefix for all endpoints
- **Error Handling**: Centralized error handling middleware
- **Logging**: Custom request logging for API endpoints

The backend implements a clean separation of concerns with:
- Routes defined in `/server/routes.ts`
- Storage abstraction in `/server/storage.ts` 
- Development server setup in `/server/vite.ts`

## Database Schema
The application uses Drizzle ORM for database management with PostgreSQL as the target database. The schema is defined in `/shared/schema.ts` and includes:
- **Users table**: Basic user management with username/password authentication
- **Type Safety**: Full TypeScript integration with Drizzle-Zod for validation
- **Migrations**: Drizzle Kit for database migrations and schema management

## Authentication & Session Management
- Session storage configured for PostgreSQL using connect-pg-simple
- User authentication schema defined but not yet implemented in routes
- Password-based authentication system ready for implementation

## Development Environment
- **Hot Reload**: Vite HMR for frontend development
- **TypeScript**: Strict type checking across the entire codebase  
- **Path Aliases**: Configured for clean imports (@/ for client, @shared for shared code)
- **Development Tools**: Runtime error overlay and cartographer integration for Replit

## Build & Deployment
- **Frontend Build**: Vite builds to `/dist/public` for static file serving
- **Backend Build**: esbuild creates Node.js compatible bundle in `/dist`
- **Production**: Express serves both API routes and static frontend files
- **Environment**: NODE_ENV-based configuration for development vs production

# External Dependencies

## Database & ORM
- **@neondatabase/serverless**: PostgreSQL driver optimized for serverless environments
- **drizzle-orm**: Type-safe ORM with full TypeScript support
- **drizzle-kit**: Migration and schema management tools
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## Frontend Libraries
- **@tanstack/react-query**: Server state management and data fetching
- **wouter**: Lightweight React router
- **date-fns**: Date manipulation and formatting utilities
- **react-hook-form**: Form handling with validation support
- **@hookform/resolvers**: Integration between React Hook Form and validation libraries

## UI Framework
- **@radix-ui/***: Comprehensive set of unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant API for component styling
- **clsx & tailwind-merge**: Utility functions for conditional CSS classes
- **cmdk**: Command palette component
- **embla-carousel-react**: Carousel component for image/content sliding

## Development Tools
- **vite**: Fast build tool and development server
- **@vitejs/plugin-react**: React integration for Vite
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Replit-specific development tooling

## Validation & Utilities
- **zod**: Runtime type validation and schema definition
- **drizzle-zod**: Integration between Drizzle ORM and Zod validation
- **nanoid**: URL-safe unique ID generator