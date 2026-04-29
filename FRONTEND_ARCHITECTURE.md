# Frontend Architecture Overview

This document defines the frontend architecture for the Jersey Cravings platform using Next.js App Router. It is intentionally aligned to the backend that already exists in this repository: public catalog browsing, authenticated customer flows, and role-locked admin/governance flows. The goal is a clean, scalable frontend design that is production-ready without overengineering beyond the current backend capabilities.

## Product Scope

### User Roles

The frontend supports two primary experiences:

1. **ADMIN / SUPER_ADMIN**
    - Operates the back office.
    - Manages products, categories, inventory, users, orders, payments, coupons, pickup locations, and moderation workflows.
    - Has access to dashboard metrics and operational views.

2. **CUSTOMER**
    - Browses public products and categories.
    - Manages cart, checkout, profile, addresses, orders, reviews, loyalty, and referrals.
    - Uses the storefront and account area only.

### Supported Product Boundaries

The frontend should be designed around the backend that exists today:

- Public catalog browsing and search are supported.
- Customer authentication and session management are supported.
- Customer cart, checkout, payment initiation, and order history are supported.
- Admin governance, audit, and dashboard flows are supported.
- Gift add-ons, coupons, pickup fulfillment, loyalty, referrals, and reviews are supported where exposed by the backend.

### Explicitly Out of Scope

The frontend should not model unsupported product ideas as first-class features:

- Wishlist
- Guest checkout
- Seller marketplace / multi-vendor portal
- Subscriptions
- Returns / exchanges workflow
- Saved payment methods vault UI
- CMS-driven editorial content system

## 1. Feature Breakdown

### 1.1 Auth Module

**Responsibilities**

- Handle sign up, sign in, sign out, password recovery, email verification, and OAuth redirect completion.
- Manage authenticated session state and bootstrap the current user.
- Keep auth UX separate from role-specific application shells.

**Features**

- Email/password registration and login
- Google OAuth login redirect handling
- Forgot password and reset password flows
- Email verification flow
- Session bootstrap and refresh awareness
- Logout
- Role-aware post-login routing

**Key Routes**

- `/auth/login`
- `/auth/register`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/auth/verify-email`
- `/auth/callback/google`
- `/auth/logout`

**Components**

- Auth forms
- OAuth button group
- Password strength / visibility toggle
- Verification notice cards
- Session-aware route guard wrappers

**API Interactions**

- `POST /api/auth/*` for auth identity flow handled by backend auth bridge
- `GET /api/v1/auth/me` or equivalent current-user bootstrap endpoint
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh` when session refresh is needed

### 1.2 Product Module

**Responsibilities**

- Expose public catalog discovery.
- Render categories, product listings, and product details.
- Support filter, sort, pagination, search, variants, and media display.
- Surface product-related metadata needed by cart and checkout.

**Features**

- Public product listing
- Category browsing
- Product search and filtering
- Sort by price, popularity, newest, or relevance when backend supports it
- Product detail page
- Variant selection
- Product image gallery
- Related or similar products

**Key Routes**

- `/`
- `/products`
- `/products/[slug-or-id]`
- `/categories/[slug-or-id]`
- `/search`

**Components**

- Product cards
- Product grid/list switcher
- Category chips / sidebar filters
- Price range filter
- Sort control
- Product gallery
- Variant selector
- Breadcrumbs
- Product badges for status / stock / offer signals

**API Interactions**

- `GET /api/v1/products`
- `GET /api/v1/products/:id`
- `GET /api/v1/categories`
- `GET /api/v1/categories/:id`
- `GET /api/v1/products/:productId/variants`
- `GET /api/v1/products/:productId/media`

### 1.3 Cart Module

**Responsibilities**

- Maintain customer shopping cart state.
- Sync cart with backend for authenticated sessions.
- Keep cart and checkout state consistent across product pages and account area.

**Features**

- Add to cart
- Update quantity
- Remove item
- Apply coupon if supported at cart or checkout stage
- Display subtotal, discount, delivery, and payable summary
- Persist cart server-side for authenticated users

**Key Routes**

- `/cart`
- `/cart/summary`
- `/checkout` as the handoff from cart to order creation

**Components**

- Cart item rows
- Quantity stepper
- Cart summary card
- Coupon input block
- Shipping / fulfillment selector when relevant
- Sticky checkout action bar

**API Interactions**

- `GET /api/v1/carts/me`
- `POST /api/v1/carts/items`
- `PATCH /api/v1/carts/items/:itemId`
- `DELETE /api/v1/carts/items/:itemId`
- `POST /api/v1/carts/clear`

### 1.4 Order Module

**Responsibilities**

- Convert cart state into orders.
- Support customer order history and order detail views.
- Handle payment initiation and order lifecycle visibility.

**Features**

- Checkout form
- Order placement
- Delivery or pickup selection when supported
- Gift add-on selection when supported
- Coupon application and validation feedback
- Order history
- Order detail page
- Order cancellation where allowed
- Payment status tracking

**Key Routes**

- `/checkout`
- `/orders`
- `/orders/[id]`
- `/orders/[id]/payment`
- `/orders/[id]/success`

**Components**

- Checkout stepper
- Address selector
- Pickup location selector
- Order summary sidebar
- Gift add-on picker
- Payment method selector
- Order timeline/status chip
- Order list cards / table rows

**API Interactions**

- `POST /api/v1/orders`
- `GET /api/v1/orders/me`
- `GET /api/v1/orders/:id`
- `PATCH /api/v1/orders/:id/cancel`
- `POST /api/v1/payments` or the equivalent payment-init endpoint
- `GET /api/v1/payments/:id`

### 1.5 User / Profile Module

**Responsibilities**

- Manage customer profile, addresses, reviews, loyalty, and referrals.
- Provide account center functionality after login.

**Features**

- Profile view and edit
- Address book CRUD
- Order-linked review creation and review history
- Loyalty wallet / points view
- Referral code view and referral event history
- Account security settings such as password change

**Key Routes**

- `/account`
- `/account/profile`
- `/account/addresses`
- `/account/reviews`
- `/account/loyalty`
- `/account/referrals`
- `/account/security`

**Components**

- Profile form
- Address form modal or page
- Address cards
- Review form and rating input
- Loyalty summary card
- Referral code card
- Security settings panel

**API Interactions**

- `GET /api/v1/customers/profile/me`
- `PATCH /api/v1/customers/profile`
- `GET /api/v1/customers/addresses`
- `POST /api/v1/customers/addresses`
- `PATCH /api/v1/customers/addresses/:id`
- `DELETE /api/v1/customers/addresses/:id`
- `GET /api/v1/customers/reviews`
- `POST /api/v1/customers/reviews`
- `GET /api/v1/customers/loyalty`
- `GET /api/v1/customers/referrals`

### 1.6 Admin Module

**Responsibilities**

- Provide the operational back office experience for ADMIN and SUPER_ADMIN.
- Centralize catalog management, user moderation, order oversight, and analytics.

**Features**

- Dashboard metrics and trends
- Product create / update / delete
- Category management
- Inventory and product status management
- User viewing and moderation
- Block / unblock customer actions
- Order management and status updates
- Payment inspection
- Coupon management
- Pickup location management
- Audit log visibility
- Bulk actions when supported

**Key Routes**

- `/admin`
- `/admin/dashboard`
- `/admin/products`
- `/admin/products/new`
- `/admin/products/[id]/edit`
- `/admin/categories`
- `/admin/users`
- `/admin/orders`
- `/admin/orders/[id]`
- `/admin/payments`
- `/admin/coupons`
- `/admin/fulfillment`
- `/admin/audit-logs`

**Components**

- Admin dashboard cards
- Metrics charts
- Filterable data tables
- Status badges
- Bulk action toolbar
- Drawer or modal edit forms
- Confirmation dialogs
- Activity / audit timeline

**API Interactions**

- `GET /api/v1/dashboard/*`
- `GET /api/v1/admins`
- `PATCH /api/v1/admins/:id/status`
- `GET /api/v1/products`
- `POST /api/v1/products`
- `PATCH /api/v1/products/:id`
- `DELETE /api/v1/products/:id`
- `GET /api/v1/categories`
- `POST /api/v1/categories`
- `PATCH /api/v1/categories/:id`
- `DELETE /api/v1/categories/:id`
- `GET /api/v1/orders`
- `PATCH /api/v1/orders/:id/status`
- `GET /api/v1/payments`
- `GET /api/v1/audit-logs`
- `POST /api/v1/bulk-actions`

### 1.7 Shared / Common Module

**Responsibilities**

- Expose shared design system primitives and utility hooks.
- Reduce duplication across storefront, account, and admin shells.

**Features**

- App layout primitives
- Page headers and section shells
- Form controls and validation helpers
- Table wrappers and pagination UI
- Modal, drawer, and confirmation patterns
- Skeleton, loading, empty, and error states
- Toast / notification system
- Icon and badge system

**Key Routes**

- No standalone routes; used across all route groups.

**Components**

- Buttons
- Inputs
- Selects
- Textareas
- Radios / checkboxes
- Tabs
- Badges
- Cards
- Tables
- Modals
- Drawers
- Skeletons
- Empty state panels
- Error alert blocks

**API Interactions**

- Shared API client wrapper
- Authenticated request wrapper with credentials
- Query key and invalidation utilities

## 2. Admin Panel Structure

The admin panel should be a dedicated route group with its own layout, navigation, and protection rules. The admin shell should never be mixed with customer-facing routes.

### 2.1 Admin Routes

- `/admin/dashboard`
- `/admin/products`
- `/admin/products/new`
- `/admin/products/[id]/edit`
- `/admin/categories`
- `/admin/users`
- `/admin/users/[id]`
- `/admin/orders`
- `/admin/orders/[id]`
- `/admin/payments`
- `/admin/coupons`
- `/admin/fulfillment`
- `/admin/audit-logs`
- `/admin/settings` if later needed

### 2.2 Admin Components

- Sidebar navigation
- Topbar with search and profile menu
- Metric cards
- Charts for sales, order volume, and revenue trends
- Table view for users, products, and orders
- Filters for date, status, role, category, and payment state
- Batch action toolbar
- Row action menus
- Detail drawer / modal
- Destructive confirmation modal

### 2.3 Admin Tables and Forms

**Product Management**

- Product create form
- Product edit form
- Variant editor
- Media upload form
- Inventory quantity editor
- Active / inactive status toggle
- Category assignment control

**User Management**

- User list table
- User detail panel
- Block / unblock status action
- Role display and status badges

**Order Management**

- Order list table
- Order detail timeline
- Order status update control
- Payment reference view
- Fulfillment view

**Dashboard**

- Revenue summary cards
- Order count cards
- Recent order feed
- Customer activity feed
- Product performance snapshot

## 3. Customer Side Structure

### 3.1 Public Home Experience

The customer journey should begin with a storefront-first experience that allows anonymous browsing and conversion into authenticated checkout when needed.

**Routes**

- `/`
- `/products`
- `/products/[id]`
- `/categories/[id]`
- `/search`

**Home Page Responsibilities**

- Introduce the brand and current offer surfaces
- Highlight featured products and categories
- Surface best sellers or trending items when available
- Move users quickly into product discovery

### 3.2 Full User Journey

1. **Browse**
    - User lands on the home page or product listing.
    - They search, filter, and open product details.

2. **Evaluate**
    - Product details show images, variants, stock, description, and related items.
    - User selects quantity, variant, and optional add-ons.

3. **Add to Cart**
    - Selected item is added to the cart.
    - Cart summary updates immediately.

4. **Checkout**
    - User reviews cart, selects address or pickup location, applies coupon if valid, and chooses payment / fulfillment options.
    - Backend rules are respected in the UI: COD should only appear for pickup, and delivery options should be limited to the supported region.

5. **Place Order**
    - User submits the order and is redirected to order confirmation or payment handling.

6. **Track Order**
    - User checks order status, payment state, and fulfillment progress in their account area.

7. **Return to Account**
    - User manages profile, addresses, reviews, loyalty, and referrals in one place.

### 3.3 Customer Routes

- `/account`
- `/cart`
- `/checkout`
- `/orders`
- `/orders/[id]`
- `/account/profile`
- `/account/addresses`
- `/account/loyalty`
- `/account/referrals`
- `/account/reviews`

### 3.4 Customer Components

- Hero section
- Promotional banners
- Product cards
- Category navigation
- Cart drawer or cart page
- Checkout steps
- Address selector
- Pickup selector
- Payment method panel
- Order status tracker
- Account sidebar or tab navigation

## 4. Data Flow Design

### 4.1 Server Component -> Prefetch -> Hydration

The frontend should use App Router server components for first-load performance and SEO-critical pages, then hydrate interactivity on the client where needed.

Recommended usage:

- Server components fetch initial catalog, product detail, and order history data where the page benefits from fast first paint.
- Client components take over for cart mutations, checkout forms, admin tables, and interactive filtering.
- Initial server-fetched data should be passed into Tanstack Query cache hydration when a client query needs to continue from the same payload.

### 4.2 Tanstack Query Usage Per Module

Use Tanstack Query as the primary client-side server-state layer.

- **Auth**: current-user bootstrap, session refresh status, logout mutation.
- **Product**: category lists, product lists, product details, related products, search result queries.
- **Cart**: cart read, item add/update/delete mutations, clear cart.
- **Order**: order creation, order list, order detail, cancel mutation, payment status reads.
- **Profile**: profile read/update, address CRUD, reviews, loyalty, referrals.
- **Admin**: dashboard summaries, tables, filters, status mutations, bulk actions.

### 4.3 Mutation Flows

- **Create order**
    - Validate cart state and checkout inputs on the client.
    - Submit order mutation.
    - On success, clear or refresh cart state and navigate to confirmation or payment.

- **Update profile**
    - Submit profile patch mutation.
    - Invalidate current-user and profile queries.

- **Edit product / user / order in admin**
    - Submit the mutation from modal or edit page.
    - Invalidate the corresponding list and detail queries.
    - Keep optimistic updates limited to low-risk fields such as toggle status where appropriate.

- **Cart mutations**
    - Optimistically update UI for quantity and removal.
    - Reconcile with the server response immediately.

### 4.4 Cache Invalidation Strategy

Keep invalidation predictable and module-scoped.

- Invalidate product list queries after product admin writes.
- Invalidate cart queries after cart mutations.
- Invalidate order list and order detail queries after order creation, cancellation, or status changes.
- Invalidate current-user and profile queries after auth or profile updates.
- Invalidate dashboard metrics after admin writes that affect aggregates.
- Invalidate review, loyalty, and referral queries after customer-side writes.

## 5. Auth & Access Control

### 5.1 Public vs Protected Routes

**Public routes**

- Home
- Product listing
- Product details
- Category listing
- Auth pages

**Protected customer routes**

- Cart
- Checkout
- Orders
- Account center

**Protected admin routes**

- Entire `/admin` route group

### 5.2 Role-Based Rendering

- Use the authenticated user payload to determine whether to render customer or admin navigation.
- Admin users should be routed to the admin dashboard after login.
- Customers should be routed to storefront or account views.
- Shared authenticated features should still respect backend authorization, not only UI hiding.

### 5.3 Middleware / Proxy Usage

The App Router should use route protection at the boundary, ideally via middleware or a proxy guard.

- Redirect unauthenticated users away from protected customer and admin routes.
- Redirect non-admin users away from admin routes.
- Preserve the intended destination in query params for post-login return.
- Treat cookie-based auth as the source of truth.

### 5.4 Session Handling

- Requests must send credentials.
- The frontend should assume the backend may refresh or rotate session state.
- If the backend indicates a session is expiring, the client should refresh current-user state and avoid hard failures when a silent refresh is possible.

## 6. Reusable Component System

### 6.1 Forms

- Input
- Select
- Textarea
- Radio group
- Checkbox group
- Date or time picker where needed
- Form error text
- Field description helper
- Validation summary

### 6.2 Tables

- TanStack Table wrapper
- Pagination controls
- Column visibility toggles
- Sorting controls
- Row action menu
- Bulk selection toolbar

### 6.3 Modals and Overlays

- Confirm dialog
- Edit drawer
- Create modal
- Image preview modal
- Delete confirmation

### 6.4 Buttons and Actions

- Primary button
- Secondary button
- Destructive button
- Loading button state
- Icon button

### 6.5 Layouts

- Public storefront layout
- Auth layout
- Customer account layout
- Admin dashboard layout

### 6.6 Common State Primitives

- Loading skeleton
- Empty state card
- Error state block
- Not found state
- Toast notification
- Badge / status pill

## 7. Final Folder Structure

The structure below is intentionally scalable and aligned with the requested top-level folders.

```text
/app
	/(public)
		page.tsx
		products/page.tsx
		products/[id]/page.tsx
		categories/[id]/page.tsx
		search/page.tsx
	/(auth)
		login/page.tsx
		register/page.tsx
		forgot-password/page.tsx
		reset-password/page.tsx
		verify-email/page.tsx
		callback/google/page.tsx
	/(customer)
		layout.tsx
		cart/page.tsx
		checkout/page.tsx
		orders/page.tsx
		orders/[id]/page.tsx
		account/page.tsx
		account/profile/page.tsx
		account/addresses/page.tsx
		account/loyalty/page.tsx
		account/referrals/page.tsx
		account/reviews/page.tsx
	/(admin)
		layout.tsx
		dashboard/page.tsx
		products/page.tsx
		products/new/page.tsx
		products/[id]/edit/page.tsx
		categories/page.tsx
		users/page.tsx
		users/[id]/page.tsx
		orders/page.tsx
		orders/[id]/page.tsx
		payments/page.tsx
		coupons/page.tsx
		fulfillment/page.tsx
		audit-logs/page.tsx

/features
	auth/
	products/
	cart/
	orders/
	profile/
	admin/
	shared/

/components
	ui/
	forms/
	tables/
	modals/
	layouts/
	feedback/

/hooks
	useAuth.ts
	useCart.ts
	useProducts.ts
	useOrders.ts
	useProfile.ts
	useAdminDashboard.ts

/services
	api-client.ts
	auth.service.ts
	product.service.ts
	cart.service.ts
	order.service.ts
	profile.service.ts
	admin.service.ts

/types
	auth.ts
	product.ts
	cart.ts
	order.ts
	profile.ts
	admin.ts
	api.ts

/lib
	query-client.ts
	query-keys.ts
	route-helpers.ts
	auth-guards.ts
	formatters.ts
	constants.ts
```

## 8. UX States

### Loading States

- Use skeletons for product listing, product details, order history, and admin tables.
- Use inline loading states for buttons and form submissions.
- Use route-level loading UI for transitions between major sections.

### Empty States

- Empty product search results should suggest clearing filters or searching again.
- Empty cart should route users back to the catalog.
- Empty order history should highlight browsing or ordering next.
- Empty admin tables should explain the current filters or lack of data.

### Error States

- Network errors should provide retry actions.
- Validation errors should be field-level first, then form-level.
- Authorization errors should redirect to login or show access denied.
- Not found errors should preserve navigation back to catalog or dashboard.

## 9. Backend-Aligned Checkout Constraints

The UI must reflect server rules instead of letting users discover them only after submission.

- Cash on delivery should only be shown when pickup is allowed.
- Delivery options should be restricted to the supported geography.
- Coupon application should be validated by the backend and displayed as a server result, not a client-only promise.
- Gift add-ons should be presented only if the order flow supports them.
- Payment completion should be treated as backend-authoritative, especially for webhook-based confirmation.

## 10. Recommended Frontend Architecture Summary

The cleanest implementation is a split-shell App Router design:

- A public storefront shell for anonymous browsing and customer onboarding.
- A protected customer shell for cart, checkout, and account management.
- A separate admin shell for dashboard and operational work.

This structure keeps the UI understandable, lets server components handle initial reads efficiently, and allows Tanstack Query to manage interactive client-side state where mutations and cache invalidation matter most. It also mirrors the backend’s actual domain boundaries, which keeps the frontend maintainable as the platform grows.
