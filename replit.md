# Mutflex - Manufacturing & Installation Management System

## Overview

Mutflex (موتفلكس) is a comprehensive SaaS platform designed to transform manufacturing and installation businesses from chaotic manual processes into streamlined digital operations. The platform serves industrial sectors including marble/granite factories, construction companies, finishing contractors, and similar manufacturing businesses.

The application is a full-stack web platform that manages the entire workflow from client onboarding and measurement scheduling through manufacturing stages, installation tracking, technician management, and document archiving. It features a bilingual interface (Arabic/English) with RTL support and provides customer-facing portals alongside internal management tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### December 31, 2025 - Schema Markup Support
- Added schemaMarkup field to articles table for custom JSON-LD storage
- Updated all External API endpoints to read/write schemaMarkup
- Updated BlogPost.tsx to render custom schemaMarkup when available

### December 28, 2025 - External API Integration (SEO Master)
- Added external API endpoints for integration with SEO Master tool
- Token-based authentication using EXTERNAL_API_TOKEN secret
- Endpoints created:
  - POST /api/external/auth/validate - Validate API token
  - GET /api/external/articles - List all articles with pagination
  - POST /api/external/articles - Create new draft article
  - GET /api/external/articles/:id - Get single article
  - PATCH /api/external/articles/:id - Update article
  - POST /api/external/articles/:id/publish - Publish article
  - GET /api/external/pages - List all pages (static + articles) for internal linking
- Response format includes all SEO fields (metaTitle, metaDescription, ogTitle, etc.)
- Pages endpoint returns both static pages and published articles with full URLs

## External Tool Integration Guide (SEO Master Prompt)

This section provides a comprehensive prompt for the external SEO management tool to properly handle mutflex (custom site) articles.

### Complete Prompt for External Tool

```
# mutflex Custom Site Integration

When managing mutflex articles, you are working with a CUSTOM SITE (not WordPress).
This means you interact directly with the External API instead of WordPress REST API.

## Authentication

All requests require Bearer token authentication:
```
Authorization: Bearer {EXTERNAL_API_TOKEN}
```

## Available Endpoints

### 1. List Articles
GET /api/external/articles?status={status}&limit={limit}&page={page}

### 2. Get Single Article
GET /api/external/articles/{id}

### 3. Create Article
POST /api/external/articles
Body: { title, content, excerpt, metaTitle, metaDescription, metaKeywords, focusKeyword, canonicalUrl, ogTitle, ogDescription, ogImage, robotsDirective, schemaMarkup, coverImage, coverImageAlt, tags }

### 4. Update Article
PATCH /api/external/articles/{id}
Body: Any fields from create (all optional)

### 5. Publish Article
POST /api/external/articles/{id}/publish

### 6. Get All Pages (for internal linking)
GET /api/external/pages

## SEO Management Capabilities

### 1. Meta Title & Description Optimization
- Update via PATCH with metaTitle and metaDescription fields
- Recommended length: Title 50-60 chars, Description 150-160 chars
- Always include focus keyword naturally

### 2. Canonical URL Setup
- Set canonicalUrl field to prevent duplicate content issues
- Format: Full URL (https://mutflex.com/blog/{slug})
- Use when article content is syndicated or similar pages exist

### 3. Robots Directive Configuration
- Field: robotsDirective
- Options: "index, follow" (default), "noindex, follow", "index, nofollow", "noindex, nofollow"
- Use noindex for thin content, duplicate pages, or private articles

### 4. Schema Markup (JSON-LD)
- Field: schemaMarkup
- Store complete JSON-LD schema as a string
- If provided, this custom schema will be used instead of auto-generated schema
- If empty/null, system auto-generates ArticleSchema from article data

Example schemaMarkup value:
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "description": "Article description",
  "image": "https://mutflex.com/image.webp",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Mutflex",
    "logo": {
      "@type": "ImageObject",
      "url": "https://mutflex.com/logo.png"
    }
  },
  "datePublished": "2025-12-31T00:00:00Z",
  "dateModified": "2025-12-31T00:00:00Z"
}
```

### 5. Open Graph Tags
- ogTitle: Social media title (defaults to article title if empty)
- ogDescription: Social media description (defaults to metaDescription/excerpt)
- ogImage: Full URL to social sharing image

### 6. Internal Linking
- Use GET /api/external/pages to fetch all available pages
- Returns array of { type, title, slug, url }
- Types: "static" (fixed pages) and "article" (blog posts)
- Use these URLs when adding internal links within article content

## Key Differences from WordPress

| Feature | WordPress | mutflex (Custom) |
|---------|-----------|------------------|
| API Base | /wp-json/wp/v2/ | /api/external/ |
| Auth | WordPress cookies/nonce | Bearer Token |
| Create Post | POST /posts | POST /articles |
| Update Post | PUT /posts/{id} | PATCH /articles/{id} |
| Yoast SEO | Separate plugin fields | Built-in fields |
| Schema | Yoast/plugins | schemaMarkup field |
| Featured Image | media_id reference | coverImage URL string |

## Response Format

All responses follow this structure:
```json
{
  "success": true,
  "article": { ... },
  "message": "Operation description"
}
```

Or for lists:
```json
{
  "success": true,
  "articles": [...],
  "total": 100
}
```

## Error Handling

- 401: Invalid or missing token
- 404: Article not found
- 400: Invalid request (missing title, etc.)
- 500: Server error

## Display Buttons

For mutflex sites, display:
- "Manage" button: Opens article management interface
- "Analyze" button: Runs SEO analysis on article

Both buttons should use the External API endpoints documented above.
```

### December 28, 2025 - SEO Meta Tags for All Pages
- Added SEOHead component to Contact, Blog, Industries, FreeTrial, PrivacyPolicy pages
- Each page now has unique title, description, keywords, and canonical URL

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