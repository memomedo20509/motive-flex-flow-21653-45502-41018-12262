# Mutflex - Manufacturing & Installation Management System

## Overview

Mutflex (موتفلكس) is a comprehensive SaaS platform designed to transform manufacturing and installation businesses (e.g., marble/granite factories, construction, finishing contractors) from manual processes into streamlined digital operations. This full-stack web platform manages the entire workflow from client onboarding and measurement scheduling through manufacturing, installation tracking, technician management, and document archiving. It features a bilingual interface (Arabic/English) with RTL support, offering customer-facing portals and internal management tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React 18, TypeScript, and Vite. It uses Wouter for routing, TanStack Query for server state management, and Radix UI primitives with custom shadcn/ui components for the UI. Styling is handled by TailwindCSS, incorporating a custom design system and CSS variables. Forms are managed with React Hook Form and Zod validation. The design system features a custom color scheme (industrial gold and teal), dual fonts (Tajawal for Arabic, Inter for English), rounded corners, and enhanced shadows, with an RTL-first approach. Components follow an atomic design pattern.

Key UI/UX decisions include:
- **Motion System**: Unified professional animation system in `client/src/index.css` with intersection-based animations (520ms duration, cubic-bezier easing), 120ms stagger delays, 16px vertical translate, and bidirectional scroll support. Full reduced motion support is included.
- **Reusable Components**: `useIntersection` hook and `AnimateOnScroll` wrapper.
- **Landing Page Enhancements**: Simplified CTA design, enhanced typography, trust badges, icon-accent lighting on hover for workflow cards, and staggered grid reveals for features.
- **SEO Integration**: Comprehensive SEO fields (metaTitle, metaDescription, metaKeywords, canonicalUrl, ogTitle, ogDescription, ogImage, robotsDirective, readingTime) are integrated into article schemas and managed through an enhanced ArticleForm. This includes an HTML file import feature and server-side HTML parsing using Cheerio. SEO meta tags are dynamically generated for all static and dynamic pages.
- **Performance**: Images include `width`/`height` attributes and `loading="lazy"`. Font loading is optimized with preload hints and `font-display: swap`, and unused font weights/CDNs are removed. React.lazy and Suspense are used for code splitting on non-critical paths.

### Backend Architecture

The backend uses Express.js on Node.js with TypeScript. It features a RESTful API structure under `/api/*` with JSON-based request/response formats. Development uses `tsx watch` for hot reloading and Vite middleware integration for HMR. Production builds utilize `esbuild`. Code is organized with route handlers in `server/routes.ts`, storage abstraction in `server/storage.ts`, and shared schema definitions in `shared/schema.ts`.

### Data Storage Solutions

Currently, an in-memory storage implementation (`MemStorage`) is used for development, designed with an `IStorage` interface for easy swapping. The system is designed to use Drizzle ORM with PostgreSQL, leveraging `drizzle-orm/pg-core` for schema definitions (e.g., `pgTable`, `serial`, `text`, `timestamp`) and `drizzle-zod` for runtime validation.

### Authentication and Authorization

A custom authentication system using bcrypt and sessions has replaced Replit Auth. This includes login/logout/me endpoints, a dedicated login page, and an admin user management API with a UI for user CRUD operations. Resend is integrated for email notifications. Supabase client (`@supabase/supabase-js`) is included for planned authentication and potential database hosting.

## External Dependencies

### Third-Party Services
- **Supabase**: Planned for authentication and database hosting.
- **Resend**: Used for email notifications.
- **SEO Master**: External API integration for advanced SEO management, including token-based authentication and endpoints for articles and pages.
- **SMS Service**: Planned integration for customer notifications.

### UI Component Libraries
- **Radix UI**: Accessible UI primitives (accordion, dialog, dropdown-menu, etc.).
- **Lucide React**: Icon library.
- **Embla Carousel**: Carousel/slider functionality.
- **CMDK**: Command menu component.
- **Input OTP**: One-time password input component.

### Utility Libraries
- **date-fns**: Date manipulation.
- **clsx & tailwind-merge**: Conditional className utilities.
- **React Hook Form**: Form state management.
- **Zod**: Schema validation.
- **class-variance-authority**: Type-safe component variants.
- **Cheerio**: Server-side HTML parsing.

### Development Tools
- **ESLint**: Linter.
- **TypeScript**: Type checking.
- **PostCSS with Tailwind and Autoprefixer**: CSS processing.
- **Vite**: Frontend build tool.
- **esbuild**: Server bundling.
- **tsx**: TypeScript execution in development.
- **Lovable tagger**: Component tracking.