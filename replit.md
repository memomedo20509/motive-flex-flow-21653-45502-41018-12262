# Mutflex - Manufacturing & Installation Management System

## Overview

Mutflex (موتفلكس) is a comprehensive SaaS platform designed to transform manufacturing and installation businesses from chaotic manual processes into streamlined digital operations. The platform serves industrial sectors including marble/granite factories, construction companies, finishing contractors, and similar manufacturing businesses.

The application is a full-stack web platform that manages the entire workflow from client onboarding and measurement scheduling through manufacturing stages, installation tracking, technician management, and document archiving. It features a bilingual interface (Arabic/English) with RTL support and provides customer-facing portals alongside internal management tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### November 12, 2025 - Motion System & UI Enhancements

**Phase 1: Motion System Infrastructure**
- Added comprehensive CSS motion utilities in `client/src/index.css`:
  - Intersection-based animations (.animate-on-scroll, .in-view)
  - Staggered delays for children (.stagger-children)
  - Glass morphism effects (glass-effect, glass-card)
  - Enhanced hover effects (hover-lift, hover-glow, icon-accent)
  - Shimmer loading animations
  - Counter animations
  - Reduced motion support (@media prefers-reduced-motion)

- Created reusable hooks and components:
  - `useIntersection` hook: IntersectionObserver wrapper with cleanup
  - `AnimatedCounter` component: Animated number counting with easing
  - `AnimateOnScroll` wrapper: Reusable scroll-triggered animation wrapper

**Landing Page (Index.tsx) Enhancements:**
- Hero Section:
  - Added animated KPI strip with 3 metrics (300+ factories, 10K+ hours, 5K+ orders)
  - Implemented glass morphism CTA container
  - Enhanced typography hierarchy (H1: 7xl, H2: 5xl, Body: xl responsive)
  - Added hover glow effects on KPI cards
  - All elements include proper data-testid attributes

- Workflow Cards:
  - Applied AnimateOnScroll to all workflow cards (desktop + mobile)
  - Implemented staggered entrance animations
  - Added icon-accent lighting on hover
  - Enhanced card hover effects (border, scale, glow)

**Technical Quality:**
- Proper cleanup for all side effects (requestAnimationFrame, IntersectionObserver)
- Accessibility: Reduced motion support throughout
- Performance: Optimized with proper thresholds and cleanup
- Testing: Comprehensive data-testid coverage for automated testing
- RTL support maintained throughout

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: React 18 with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI primitives with custom shadcn/ui components
- **Styling**: TailwindCSS with custom design system and CSS variables
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers

**Design System:**
- Custom color scheme with primary (industrial gold - hsl 45 76% 51%) and secondary (industrial teal - hsl 177 81% 30%) colors
- Dual font system: Tajawal for Arabic, Inter for English
- Component variants using class-variance-authority
- Rounded corners (0.75rem default), enhanced shadows, and hover states
- RTL-first design with proper Arabic typography support

**Component Architecture:**
- Atomic design pattern with reusable UI components in `/client/src/components/ui/`
- Page-level components in `/client/src/pages/`
- Shared components like Navbar and Footer
- All components use TypeScript for type safety

**Routing Structure:**
- Landing page (/)
- Features showcase (/features)
- Industry-specific pages (/industries)
- Pricing information (/pricing)
- Contact form (/contact)
- About page (/about)
- Free trial registration (/free-trial)
- Privacy policy (/privacy-policy)
- 404 fallback for unknown routes

### Backend Architecture

**Server Framework:**
- Express.js running on Node.js
- TypeScript for type safety across the entire stack
- Development mode uses tsx watch for hot reloading
- Production build uses esbuild for bundling

**API Design:**
- RESTful API structure with `/api/*` prefix
- Example endpoints demonstrate CRUD pattern (GET /api/examples, POST /api/examples)
- Request/response logging middleware for debugging
- JSON-based request/response format

**Development Setup:**
- Vite middleware integration for HMR during development
- Separate build process for client (Vite) and server (esbuild)
- Single server serves both API and static assets in production

**Code Organization:**
- Route handlers in `/server/routes.ts`
- Storage abstraction layer in `/server/storage.ts` (currently using in-memory storage)
- Shared schema definitions in `/shared/schema.ts`
- Server configuration and Vite setup in `/server/vite.ts`

### Data Storage Solutions

**Current Implementation:**
- In-memory storage implementation (`MemStorage` class) for development
- Interface-based design (`IStorage`) allowing easy swapping of storage backends

**Schema Definition:**
- Drizzle ORM for schema definitions with PostgreSQL types
- Zod schemas derived from Drizzle schemas for runtime validation
- Example schema includes: id (serial), name (text), createdAt (timestamp)
- Type inference for insert and select operations

**Future Database Integration:**
- Designed to use Drizzle ORM with PostgreSQL
- Schema definitions use `drizzle-orm/pg-core` (pgTable, serial, text, timestamp)
- Validation schemas created with `drizzle-zod` for consistency

### Authentication and Authorization

**Planned Implementation:**
- Supabase client (@supabase/supabase-js) included in dependencies
- No current authentication implementation in codebase
- User management will likely integrate with Supabase Auth

### External Dependencies

**Third-Party Services:**
- **Supabase**: Backend-as-a-Service for authentication and potential database hosting
- **SMS Service**: Planned integration for sending customer notifications with images (referenced as "mutaba" in free trial page)

**UI Component Libraries:**
- Radix UI: Comprehensive set of accessible UI primitives (accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, navigation-menu, popover, select, tabs, toast, tooltip, etc.)
- Lucide React: Icon library
- Embla Carousel: Carousel/slider functionality
- CMDK: Command menu component
- Input OTP: One-time password input component

**Utility Libraries:**
- date-fns: Date manipulation and formatting
- clsx & tailwind-merge: Conditional className utilities
- React Hook Form: Form state management
- Zod: Schema validation
- class-variance-authority: Type-safe component variants

**Development Tools:**
- ESLint with TypeScript support
- TypeScript with multiple tsconfig files (app, node)
- PostCSS with Tailwind and Autoprefixer
- Lovable tagger for component tracking in development

**Build & Runtime:**
- Vite for frontend development and building
- esbuild for server bundling
- Express for HTTP server
- tsx for TypeScript execution in development

**Path Aliases:**
- @/: Points to `/client/src/`
- @shared/: Points to `/shared/`
- @assets/: Points to `/client/public/`