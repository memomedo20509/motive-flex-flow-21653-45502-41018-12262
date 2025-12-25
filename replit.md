# Mutflex - Manufacturing & Installation Management System

## Overview

Mutflex (موتفلكس) is a comprehensive SaaS platform designed to transform manufacturing and installation businesses from chaotic manual processes into streamlined digital operations. The platform serves industrial sectors including marble/granite factories, construction companies, finishing contractors, and similar manufacturing businesses.

The application is a full-stack web platform that manages the entire workflow from client onboarding and measurement scheduling through manufacturing stages, installation tracking, technician management, and document archiving. It features a bilingual interface (Arabic/English) with RTL support and provides customer-facing portals alongside internal management tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### December 25, 2025 - SEO Enhancement & HTML Import Feature
- Added comprehensive SEO fields to articles schema: metaKeywords, focusKeyword, canonicalUrl, ogTitle, ogDescription, ogImage, robotsDirective, readingTime
- Updated ArticleForm.tsx with:
  - HTML file import feature via "استيراد HTML" button
  - SEO fields section with character counts for meta title/description
  - Open Graph section for social media sharing
  - Robots directive selector (index/noindex, follow/nofollow)
  - Auto-calculated reading time display
- Added `/api/admin/articles/parse-html` endpoint using cheerio for server-side HTML parsing
- Security: Memory-based upload with 2MB limit, admin-only access
- Database migration applied for new columns

### December 16, 2025 - Performance Optimizations
- Added width/height attributes to all images to prevent CLS (Cumulative Layout Shift)
- Implemented loading="lazy" for all below-the-fold images
- Optimized font loading with preload hints and font-display: swap
- Reduced Google Fonts weight variants (removed 300, 800, 900)
- Removed unused Font Awesome CDN link
- Implemented React.lazy code splitting for all pages except Index (critical path)
- Added Suspense with loading fallback for lazy-loaded components
- Files affected: index.html, App.tsx, Navbar.tsx, Footer.tsx, Login.tsx, Blog.tsx, BlogPost.tsx, AdminLayout.tsx, ArticleForm.tsx

### December 14, 2025 - Free Trial Form System
- Fixed Free Trial form at /free-trial to save data to database
- Added trial_submissions table with: id, fullName, email, phone, company, industry, isRead, createdAt
- Updated FreeTrial.tsx to use react-hook-form with useMutation (same pattern as Contact.tsx)
- Added API endpoints: POST /api/trial, GET /api/admin/trials, PATCH /api/admin/trials/:id/read, DELETE /api/admin/trials/:id
- Created admin/TrialsList.tsx for managing trial submissions at /admin/trials
- Added "طلبات التجربة" nav item in AdminLayout

### December 14, 2025 - Admin Settings Page
- Created settings table in database for app configuration
- Added Settings.tsx page at /admin/settings with email notification settings
- Updated contact form to use notification_email from settings database
- Added settings nav item in AdminLayout

### December 14, 2025 - Custom Authentication System
- Replaced Replit Auth with custom authentication system using bcrypt + sessions
- Created server/auth.ts with login/logout/me endpoints
- Created Login.tsx page at /login with logo
- Added user management API (CRUD) for admin at /api/admin/users
- Created admin/UsersList.tsx for user management UI at /admin/users
- Integrated Resend for email notifications on contact form submission
- Added password_hash column to users table

### December 14, 2025 - Contact System & WhatsApp Button
- Added WhatsApp floating button (green, bottom-left, opens WhatsApp)
- Created contact_submissions database table
- Added contact form submission API and admin contacts list
- Updated Contact.tsx to save to database with react-hook-form
- Created admin contacts management page at /admin/contacts

### November 12, 2025 - Motion System & UI Enhancements

**Unified Professional Animation System:**
- Created comprehensive motion utilities in `client/src/index.css`:
  - Intersection-based animations with 520ms duration and cubic-bezier(0.22, 1, 0.36, 1) easing
  - Consistent 120ms stagger delays for sequential reveals (up to 9 children)
  - 16px vertical translate for subtle entrance
  - Bidirectional scroll support (triggerOnce=false) for reanimation
  - Full reduced motion support (@media prefers-reduced-motion)

**Reusable Components & Hooks:**
- `useIntersection` hook: IntersectionObserver with proper cleanup and 35% visibility threshold
- `AnimateOnScroll` wrapper: Reusable scroll-triggered animation container
- ~~`AnimatedCounter`~~: Removed animated counters per user feedback

**Landing Page (Index.tsx) Enhancements:**
- Hero Section:
  - ❌ Removed KPI strip (300+, 10K+, 5K+ counters) - user feedback
  - ✅ Simplified CTA design: Clean white/outline buttons without glass card
  - Enhanced typography hierarchy (H1: 7xl responsive, Body: xl responsive)
  - Trust badge with Shield icon above heading
  
- Workflow Cards:
  - Applied AnimateOnScroll to all workflow cards (desktop + mobile)
  - Staggered entrance animations with 120ms delay between cards
  - Icon-accent lighting effect on hover
  - Enhanced card hover effects (border-primary, scale, glow)

- Features Section:
  - Animated section heading
  - Staggered grid reveal (3 columns) with consistent timing
  - Smooth entrance animations for all feature cards

**Technical Quality:**
- Proper cleanup for all side effects (IntersectionObserver disconnect on unmount)
- Accessibility: Full reduced motion support
- Performance: Optimized with 35% visibility threshold for earlier triggers
- Testing: All interactive elements have data-testid attributes
- RTL support maintained throughout
- Bidirectional scroll: Animations trigger when scrolling up AND down

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