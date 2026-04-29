# Frontend Design

This document is the working source of truth for the current Jersey Cravings frontend. It reflects the codebase as it exists now, keeps the existing folder structure intact, and separates implemented behavior from refactor candidates and missing product surface area.

## 1. Project Setup Overview

The frontend is a Next.js App Router application written in TypeScript and styled with Tailwind CSS and shadcn/ui primitives. It uses TanStack Query for server-state management and SSR hydration, TanStack Form for form state, TanStack Table for server-driven tables, Axios for API access, Zod for validation, and JWT/session helpers for auth state management.

### Current stack

- Next.js App Router with route groups and nested layouts
- TypeScript
- Tailwind CSS
- shadcn/ui and Radix-based UI primitives
- TanStack Query with streamed hydration
- TanStack Form
- TanStack Table
- Axios API layer
- Zod validation schemas
- JWT access/refresh/session token handling

### Runtime conventions

- Browser requests go through the shared Axios client and use `withCredentials`.
- Server-side requests use the shared HTTP client that reads cookies and can refresh expiring tokens.
- Auth state is cookie-backed and role-aware.
- Protected routing is enforced in `src/proxy.ts`.
- Query caching is centralized in `QueryProvider`.

## 2. Final Folder Structure As-Is

The structure below reflects the current codebase, not an idealized target. Status markers indicate implementation state from the current frontend.

### Top-level structure

- `src/app` ✅ Next.js App Router entry point, route groups, layouts, loading states, and API proxy route
- `src/components` ✅ Shared UI and feature modules
- `src/features` ✅ Domain feature packages; currently centered on customers
- `src/hooks` ✅ Shared client hooks for table state and mobile detection
- `src/lib` ✅ Utility, auth, token, icon, and cookie helpers plus Axios clients
- `src/providers` ✅ TanStack Query provider and hydration wrapper
- `src/services` ✅ Domain service layer that wraps API clients
- `src/types` ✅ Backend-aligned TypeScript contracts
- `src/zod` ✅ Validation schemas for forms and mutations

### `src/app`

- `src/app/layout.tsx` ✅ root layout, fonts, query provider, toaster
- `src/app/loading.tsx` ✅ global loading UI
- `src/app/not-found.tsx` ✅ global not found UI
- `src/app/error.tsx` ✅ global error boundary
- `src/app/(commonLayout)` ✅ public/auth shell
- `src/app/(dashboardLayout)` ✅ authenticated shell and admin/customer route groups
- `src/app/api/proxy/[...path]/route.ts` ✅ browser proxy to backend API

### `src/components`

- `src/components/ui` ✅ base shadcn/ui primitives
- `src/components/shared` ✅ shared form and table primitives
- `src/components/modules/Auth` ✅ login, register, forgot password, reset password, verify email
- `src/components/modules/Dashboard` ✅ dashboard shell, nav, widgets, admin/customer workspace support
- `src/components/modules/Product` ✅ product management UI
- `src/components/modules/Commerce` ✅ coupons, cart, pickup locations, related commerce forms and tables
- `src/components/modules/Orders` ✅ order and payment tables/cards
- `src/components/modules/Admin` ⚠️ contains legacy admin modules unrelated to Jersey Cravings core scope and should be treated as cleanup candidates unless still imported

### `src/features`

- `src/features/customers` ✅ customer profile, address, review, loyalty, referral, and admin customer management workspace

### `src/hooks`

- `use-mobile.ts` ✅ viewport helper
- `useServerManagedDataTable.ts` ✅ server-table state helper
- `useServerManagedDataTableFilters.ts` ✅ table filter helper
- `useServerManagedDataTableSearch.ts` ✅ table search helper
- `useRowActionModalState.ts` ✅ modal state helper for row actions

### `src/lib`

- `axios` ✅ HTTP layer, error parsing, and API clients
- `authUtils.ts` ✅ route ownership, role, and redirect helpers
- `authHelpers.ts` ✅ account-state redirect helpers
- `cookieUtils.ts` ✅ cookie helpers
- `jwtUtils.ts` ✅ JWT verification and decoding
- `tokenUtils.ts` ✅ token expiry helpers and cookie token persistence
- `navItems.ts` ✅ dashboard nav definitions by role
- `iconMapper.ts` ✅ icon registry used by nav and UI
- `utils.ts` ✅ general utility helper(s)

### `src/services`

- `auth.services.ts` ✅ auth orchestration and cookie persistence
- `product.services.ts` ✅ categories, products, variants, media reads
- `commerce.services.ts` ✅ cart, coupons, pickup locations, gift add-ons
- `order.services.ts` ✅ order and payment reads
- `customer.services.ts` ✅ customer profile, address, review, loyalty, referral operations
- `admin.services.ts` ✅ dashboard summary, audit logs, admin reads
- `dashboard.services.ts` ⚠️ currently overlaps with admin dashboard aggregation concerns and should be merged or documented carefully if still used

### `src/types`

- `auth.types.ts` ✅ auth/session/user contracts
- `api.types.ts` ✅ generic API response and pagination contracts
- `admin.types.ts` ✅ admin dashboard and governance contracts
- `commerce.types.ts` ✅ commerce/cart/coupon/pickup/gift addon contracts
- `customer.types.ts` ✅ customer/profile/address/review/loyalty/referral contracts
- `order.types.ts` ✅ order/payment contracts
- `product.types.ts` ✅ catalog/product/variant/media contracts
- `dashboard.types.ts` ✅ navigation and dashboard data types
- `user.types.ts` ✅ shared user-facing types

### `src/zod`

- `auth.validation.ts` ✅ login/register/reset/password verification schemas
- `product.validation.ts` ✅ product/category/variant schemas
- `commerce.validation.ts` ✅ coupon/pickup/cart-related schemas
- `customer.validation.ts` ✅ profile/address/review/referral schemas
- `order.validation.ts` ✅ order/checkout/payment schemas
- `admin.validation.ts` ✅ admin/governance schemas

## 3. Routing Structure

The app is split into public, auth, protected customer, and protected admin areas using route groups.

### Public routes

- `/` home page

Current state:

- Public entry exists.
- A full storefront catalog surface is not yet implemented as first-class public routes in the codebase.

### Auth routes

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/verify-email`

Current state:

- Each auth page exists under `src/app/(commonLayout)/(authRouteGroup)`.
- Forms are implemented as client components in `src/components/modules/Auth`.

### Protected customer routes

- `/dashboard`
- `/cart`
- `/orders`
- `/orders/[orderId]`
- `/my-profile`
- `/change-password`

Current state:

- These routes are protected by `src/proxy.ts`.
- `src/app/(dashboardLayout)/(commonProtectedLayout)` holds the customer-protected pages.
- The customer dashboard page renders `CustomerWorkspace` from `src/features/customers`.

### Protected admin routes

- `/admin/dashboard`
- `/admin/customers`
- `/admin/customers/[customerId]`
- `/admin/products`
- `/admin/products/create`
- `/admin/products/[id]`
- `/admin/products/[id]/edit`
- `/admin/products/[id]/variants`
- `/admin/products/[id]/media`
- `/admin/orders`
- `/admin/orders/[orderId]`
- `/admin/coupons`
- `/admin/fulfillment`
- `/admin/payments`
- `/admin/activity`
- `/admin/admins`

Current state:

- Admin pages exist under `src/app/(dashboardLayout)/(adminLayout)/admin`.
- Navigation and shell are role-aware.

### Layout usage

- `src/app/layout.tsx` wraps the app with fonts, query provider, and toaster.
- `src/app/(commonLayout)/layout.tsx` is the public/auth shell.
- `src/app/(dashboardLayout)/layout.tsx` provides the authenticated dashboard shell.
- `src/app/(dashboardLayout)/(commonProtectedLayout)/layout.tsx` is the customer protected boundary.
- The admin route group is nested under the dashboard layout and uses its own navigation and shell behavior.

## 4. Module-Wise Breakdown

## 4.1 Auth Module

### Responsibilities

- Handle login, registration, forgot password, reset password, verify email, logout, and password change.
- Persist access token, refresh token, and Better Auth session token in cookies.
- Resolve post-login redirect based on role and account state.

### Features

- Login form with TanStack Form + Zod
- Register form
- Forgot password form
- Reset password form
- Verify email form
- Server action login flow
- Google OAuth redirect entry from the login page
- Password change support

### Pages/routes

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/verify-email`

### Components used

- `LoginForm`
- `RegisterForm`
- `ForgotPasswordForm`
- `ResetPasswordForm`
- `VerifyEmailForm`
- shared form primitives `AppField` and `AppSubmitButton`

### Hooks/services used

- `loginAction` in `src/app/(commonLayout)/(authRouteGroup)/login/_action.ts`
- `auth.services.ts`
- `authApiClient`
- `httpClient`
- `tokenUtils.ts`
- `authHelpers.ts`
- `authUtils.ts`

### API endpoints involved

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/refresh-token`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/change-password`
- `POST /api/v1/auth/verify-email`
- `POST /api/v1/auth/forget-password`
- `POST /api/v1/auth/reset-password`
- `GET /api/v1/auth/login/google`
- `GET /api/v1/auth/google/success`

### Current status

- Implemented: login, register, forgot/reset password, verify email, logout, token persistence, protected redirects.
- Needs refactor: login action and auth service responsibilities overlap in redirect and account-state logic.
- Missing: a dedicated auth state hook/context layer if future pages need shared session bootstrap behavior.

## 4.2 Product Module

### Responsibilities

- Manage public catalog reads and admin product CRUD flows.
- Support categories, products, variants, media, and product status changes.

### Features

- Product listing and search
- Category listing
- Product details
- Product create/edit flow
- Variant management
- Product media management
- Product status changes
- Bulk publish and archive actions

### Pages/routes

- `/admin/products`
- `/admin/products/create`
- `/admin/products/[id]`
- `/admin/products/[id]/edit`
- `/admin/products/[id]/variants`
- `/admin/products/[id]/media`

### Components used

- `ProductTable`
- `ProductForm`
- `CategoryForm`
- `VariantForm`
- `VariantTable`
- `MediaManager`
- `CategoriesManager`
- `CategoriesTable`

### Hooks/services used

- `product.services.ts`
- `productApiClient`
- TanStack Query hooks in page components for products and categories

### API endpoints involved

- `GET /api/v1/categories`
- `GET /api/v1/categories/:id`
- `POST /api/v1/categories`
- `PATCH /api/v1/categories/:id`
- `DELETE /api/v1/categories/:id`
- `PATCH /api/v1/categories/:id/restore`
- `GET /api/v1/products`
- `GET /api/v1/products/:id`
- `POST /api/v1/products`
- `PATCH /api/v1/products/:id`
- `PATCH /api/v1/products/:id/status`
- `DELETE /api/v1/products/:id`
- `PATCH /api/v1/products/:id/restore`
- `POST /api/v1/products/:productId/variants`
- `GET /api/v1/products/:productId/variants`
- `GET /api/v1/products/:productId/variants/:variantId`
- `PATCH /api/v1/products/:productId/variants/:variantId`
- `DELETE /api/v1/products/:productId/variants/:variantId`
- `GET /api/v1/products/:productId/media`
- `GET /api/v1/products/:productId/media/:mediaId`
- `POST /api/v1/products/:productId/media`
- `PATCH /api/v1/products/:productId/media/:mediaId`
- `POST /api/v1/products/:productId/media/reorder`
- `DELETE /api/v1/products/:productId/media/:mediaId`
- `POST /api/v1/bulk-actions/products/publish`
- `POST /api/v1/bulk-actions/products/archive`

### Current status

- Implemented: admin product list, create/edit pages, variants, media, and bulk actions.
- Missing: a polished public storefront product browsing experience under clean storefront routes.
- Needs refactor: the current product page uses direct query and client mutations in-page; the long-term target should move toward shared query hooks and consistent invalidation.

## 4.3 Cart Module

### Responsibilities

- Read and mutate the customer cart.
- Support coupon and pickup-related commerce flows.

### Features

- View my cart
- Add/update/remove items
- Coupon read flows
- Pickup location read flows

### Pages/routes

- `/cart`

### Components used

- `CartTable`

### Hooks/services used

- `commerce.services.ts`
- `commerceApiClient`
- cart-related TanStack Query hooks where used

### API endpoints involved

- `GET /api/v1/carts/my`
- `POST /api/v1/carts/my/items`
- `PATCH /api/v1/carts/my/items/:cartItemId`
- `DELETE /api/v1/carts/my/items/:cartItemId`
- `POST /api/v1/carts/my/clear`

### Current status

- Partially implemented: cart data access exists, but the full checkout flow and cart mutation UX should be treated as incomplete until the customer-facing flow is fully wired.
- Needs refactor: cart and checkout concerns should be kept separate in hooks and components.

## 4.4 Order Module

### Responsibilities

- Read customer orders and admin order records.
- Surface payment state and order detail state.

### Features

- Order list
- Order detail view
- Payment list and payment detail reads
- Admin order oversight

### Pages/routes

- `/orders`
- `/orders/[orderId]`
- `/admin/orders`
- `/admin/orders/[orderId]`

### Components used

- `OrdersTable`
- `OrderDetailsCard`
- `PaymentsTable`

### Hooks/services used

- `order.services.ts`
- `orderApiClient`

### API endpoints involved

- `POST /api/v1/orders`
- `GET /api/v1/orders/me`
- `GET /api/v1/orders/:id`
- `PATCH /api/v1/orders/:id/cancel`
- `GET /api/v1/payments`
- `GET /api/v1/payments/:id`

### Current status

- Implemented: order and payment data reads, admin and customer order pages.
- Missing: the full checkout-to-order placement flow is not yet represented as a complete customer UX.

## 4.5 User / Profile Module

### Responsibilities

- Manage customer profile, addresses, reviews, loyalty, and referrals.
- Provide a consolidated customer workspace.

### Features

- Profile view and edit
- Address CRUD
- Review CRUD and moderation
- Loyalty summary and transactions
- Referral code and referral events
- Admin customer status management

### Pages/routes

- `/dashboard`
- `/my-profile`
- `/change-password`
- `/admin/customers`
- `/admin/customers/[customerId]`

### Components used

- `CustomerWorkspace`
- `ProfileSummaryCard`
- `UpdateProfileForm`
- `AddressList`
- `AddressFormDialog`
- `LoyaltySummaryCard`
- `PointTransactionsTable`
- `ReferralCodeCard`
- `ReferralEventsTable`
- `ReviewFormDialog`
- `MyReviewsTable`
- `AdminCustomersWorkspace`
- `AdminCustomersTable`
- `CustomerStatusDialog`
- `AdminCustomerDetailsWorkspace`

### Hooks/services used

- customer feature hooks in `src/features/customers/hooks`
- `customer.services.ts`
- `customerApiClient`
- `customerQueryKeys`

### API endpoints involved

- `GET /api/v1/customers/profile/me`
- `PATCH /api/v1/customers/profile/me`
- `GET /api/v1/customers/profile`
- `GET /api/v1/customers/profile/:customerId`
- `PATCH /api/v1/customers/profile/status`
- `PATCH /api/v1/customers/profile/:customerId/restore`
- `GET /api/v1/customers/addresses/my`
- `POST /api/v1/customers/addresses/my`
- `PATCH /api/v1/customers/addresses/my/:addressId`
- `DELETE /api/v1/customers/addresses/my/:addressId`
- `GET /api/v1/customers/addresses/customer/:customerId`
- `GET /api/v1/customers/loyalty/me`
- `GET /api/v1/customers/loyalty/me/transactions`
- `GET /api/v1/customers/loyalty/settings`
- `PATCH /api/v1/customers/loyalty/settings`
- `GET /api/v1/customers/loyalty/customer/:customerId`
- `GET /api/v1/customers/referrals/my-code`
- `GET /api/v1/customers/referrals/my-events`
- `GET /api/v1/customers/referrals/events`
- `PATCH /api/v1/customers/referrals/events/status`
- `GET /api/v1/customers/reviews`
- `GET /api/v1/customers/reviews/my-reviews`
- `POST /api/v1/customers/reviews`
- `PATCH /api/v1/customers/reviews/:id`
- `PATCH /api/v1/customers/reviews/:id/moderate`
- `DELETE /api/v1/customers/reviews/:id`

### Current status

- Implemented: customer workspace, customer profile/address/review/loyalty/referral hooks and UI.
- Needs refactor: this domain is already well-factored and should be the model for other modules.

## 4.6 Admin Module

### Responsibilities

- Provide admin and super-admin operational workflows.
- Cover dashboard metrics, catalog management, customer management, orders, payments, coupons, fulfillment, and audit logs.

### Features

- Dashboard summary cards and activity feed
- Product CRUD and bulk actions
- Customer list, detail, and status changes
- Admin list and admin creation
- Order oversight
- Coupons and fulfillment views
- Audit logs and timeline views

### Pages/routes

- `/admin/dashboard`
- `/admin/products`
- `/admin/products/create`
- `/admin/products/[id]`
- `/admin/products/[id]/edit`
- `/admin/products/[id]/variants`
- `/admin/products/[id]/media`
- `/admin/customers`
- `/admin/customers/[customerId]`
- `/admin/orders`
- `/admin/orders/[orderId]`
- `/admin/payments`
- `/admin/coupons`
- `/admin/fulfillment`
- `/admin/activity`
- `/admin/admins`

### Components used

- `DashboardSidebar`
- `DashboardNavbar`
- `DashboardSidebarContent`
- `DashboardNavbarContent`
- `AdminDashboardContent`
- `KPICard`
- `StatsCard`
- `ActivityFeed`
- `AdminsTable`
- `CreateAdminForm`
- `AdminCustomersWorkspace`
- `AdminCustomersTable`
- `CustomerStatusDialog`
- `OrdersTable`
- `PaymentsTable`
- `CouponsTable`
- `PickupLocationsTable`
- `CouponForm`
- `PickupLocationForm`

### Hooks/services used

- `admin.services.ts`
- `dashboard.services.ts`
- `adminApiClient`
- `customer.services.ts` for customer-related admin actions
- shared server-table hooks for list pages

### API endpoints involved

- `GET /api/v1/dashboard/summary`
- `GET /api/v1/dashboard/catalog`
- `GET /api/v1/dashboard/orders`
- `GET /api/v1/dashboard/customers`
- `GET /api/v1/admins`
- `GET /api/v1/admins/:id`
- `POST /api/v1/admins`
- `PATCH /api/v1/admins/:id`
- `DELETE /api/v1/admins/:id`
- `PATCH /api/v1/admins/user/status`
- `PATCH /api/v1/admins/user/role`
- `GET /api/v1/audit-logs`
- `GET /api/v1/audit-logs/:id`
- `GET /api/v1/audit-logs/my-activity`
- `GET /api/v1/audit-logs/timeline`
- `GET /api/v1/audit-logs/:entityType/:entityId`
- `POST /api/v1/bulk-actions/products/publish`
- `POST /api/v1/bulk-actions/products/archive`
- `POST /api/v1/bulk-actions/categories/toggle`
- `POST /api/v1/bulk-actions/coupons/toggle`

### Current status

- Implemented: dashboard, customer management, admin management, audit logs, product management, coupon and fulfillment interfaces.
- Needs refactor: some admin UI code is still split across product, commerce, and dashboard modules rather than being normalized into one governance pattern.

## 5. Feature Flows

## 5.1 Login Flow

1. User opens `/login`.
2. `LoginForm` renders with TanStack Form and Zod validation.
3. Submit runs the server action `loginAction`.
4. `loginAction` validates payload with `loginZodSchema`.
5. The auth service calls the backend login endpoint and stores tokens in cookies.
6. The action fetches current user data to resolve account state.
7. If email verification or password change is required, the user is redirected to the required page.
8. Otherwise, the user is redirected to the role-appropriate route, usually `/dashboard` or `/admin/dashboard`.

## 5.2 Product Browsing Flow

1. User lands on the public home page.
2. The frontend should route users into product discovery, but the full storefront browsing experience is still incomplete.
3. Admin users can already manage product lists from `/admin/products`.
4. Product lists use TanStack Query for fetching and client-side filtering.
5. Product mutations invalidate or refetch the relevant list queries.

## 5.3 Cart to Checkout to Order Flow

1. Authenticated customer opens `/cart`.
2. Cart data is fetched from the commerce service.
3. User updates item quantities, removes items, or applies supported commerce constraints.
4. Checkout should validate backend rules such as pickup-only COD and region constraints.
5. Order creation should submit the cart state to the backend.
6. On success, the cart should refresh or clear and the user should move to order confirmation or payment.

Current note:

- The cart and order read surfaces exist, but the full checkout mutation flow still needs completion and should be treated as a build priority.

## 5.4 Admin Product CRUD Flow

1. Admin opens `/admin/products`.
2. The list page fetches product and category data.
3. Admin filters, searches, or bulk-selects products.
4. Admin opens create or edit pages for a product.
5. Product form submits to the product API.
6. Variant and media pages manage subresources independently.
7. Product mutations should invalidate product and dashboard caches.

## 5.5 Admin User Management Flow

1. Admin opens `/admin/customers` or `/admin/admins`.
2. The table fetches paginated rows with server-side search, sort, and filter.
3. Admin opens the customer detail page or triggers a status change.
4. Status changes are submitted through modal/dialog UIs.
5. On success, customer list and detail queries are invalidated.

## 5.6 Dashboard Data Flow

1. Admin dashboard page fetches summary and analytics data on the server.
2. Server-side reads are performed in parallel.
3. Dashboard widgets render the data immediately.
4. Client components handle table and dropdown interactivity.
5. Mutations elsewhere should invalidate dashboard aggregates when they affect counts or revenue.

## 6. TanStack Query + Data Flow

The preferred data strategy is the advanced SSR pattern from TanStack Query: server fetch first, hydrate the cache, then continue reads and mutations in client components.

### Recommended data path

1. Server component fetches initial data.
2. The fetched result is prefetched into a `QueryClient`.
3. The server renders the page with dehydrated or streamed hydration state.
4. Client components resume from the same cache using TanStack Query hooks.
5. Mutations invalidate the smallest stable query scope possible.

### Current implementation reality

- `src/providers/QueryProvider.tsx` already sets up `QueryClientProvider` and `ReactQueryStreamedHydration`.
- Many current pages still fetch directly in-page with `useQuery` instead of a dedicated prefetch/dehydrate boundary.
- Some server actions and server components fetch directly from service methods, which is acceptable as long as the cache strategy remains consistent.

### Data interface expectations

- Dashboard data should have a server-first interface because it is primarily read-only and analytics-heavy.
- Shared list pages should use query keys that encode search, sort, filter, and pagination state.
- Mutations should invalidate list and detail keys predictably.

### Mutation and invalidation strategy

- Invalidate the specific list after create/update/delete.
- Invalidate detail queries for the edited entity.
- Invalidate dashboard aggregates after mutations that affect counts or totals.
- Invalidate customer profile and account queries after auth or profile updates.
- Invalidate cart queries after cart mutations.

### Query key pattern

- Keep stable top-level namespaces per module.
- Encode server parameters into serialized query keys where necessary.
- Reuse a single module-scoped key factory for customer features as the reference pattern.

## 7. Auth and Token Flow

### Proxy and route guarding

- The current route guard lives in `src/proxy.ts`.
- There is no separate `middleware.ts` in the codebase at this time.
- The proxy reads cookies, verifies the access token, resolves the user role, and blocks or redirects routes based on account state and role.

### Token handling

- Access token, refresh token, and Better Auth session token are stored in cookies.
- `tokenUtils.ts` persists token lifetimes based on JWT expiry.
- `jwtUtils.ts` verifies and decodes JWTs.
- The HTTP client can proactively refresh an expiring token on the server.

### Protected route logic

- Unauthenticated users are redirected to `/login` with the original destination preserved.
- Authenticated users are prevented from revisiting auth pages unless account state requires it.
- Users who need email verification are redirected to `/verify-email`.
- Users who need a password change are redirected to `/reset-password`.
- Admin routes are restricted to admin and super-admin roles.
- Customer protected routes are restricted to customer roles or the common protected set.

### Role-based access

- `ADMIN` and `SUPER_ADMIN` use the admin shell and admin dashboard route.
- `CUSTOMER` uses the customer dashboard route.
- `SUPER_ADMIN` is normalized to `ADMIN` in most frontend helpers.

### Auth state notes

- `src/lib/authHelpers.ts` contains account-state redirect helpers.
- `src/lib/authUtils.ts` contains route ownership and redirect validation helpers.
- `src/components/modules/Dashboard/UserDropdown.tsx` currently shows logout UI but the action is still stubbed and should be wired to the auth logout flow.

## 8. Forms System

### Reusable form primitives

- `AppField` wraps label, input, validation display, prepend/append controls, and accessibility wiring.
- `AppSubmitButton` wraps loading and disabled states for submit actions.

### Form stack

- TanStack Form manages form state and submission behavior.
- Zod schemas validate data on change and on submit.
- Form components consume generated field APIs rather than manually wiring input state.

### Current auth form structure

- Each auth form is a client component.
- The form builds on `useForm`.
- Field-level validation comes from the corresponding Zod schema.
- Server errors are shown in alert blocks.
- Loading states are handled by `AppSubmitButton`.

### Password-related flows

- Login form supports email and password entry.
- Forgot password form submits email only.
- Reset password form requires email, OTP, and new password.
- Change password uses current password plus new password.

## 9. Admin Dashboard Design

### Layout structure

- The dashboard shell uses a sidebar plus top navbar layout.
- Desktop sidebar and mobile sheet navigation are both supported.
- The content area is wrapped in a scrollable main surface.

### Navigation model

- Navigation items are role-aware and assembled from `src/lib/navItems.ts`.
- Admin and customer users receive different section lists.
- The sidebar and navbar both derive the default home route from the user role.

### Dashboard widgets

- KPI summary cards
- Revenue, order, customer, and active product metrics
- Catalog stats card
- Order stats card
- Customer stats card
- Activity feed

### Users and customer tables

- Tables use TanStack Table and the shared `DataTable` wrapper.
- Search, filters, sorting, and pagination are server-driven.
- Row actions are expressed with buttons or dropdown menus depending on the page.

### Actions

- Block or unblock customers through status dialogs
- Restore deleted customers
- Create admins
- Open row detail views
- Trigger product publish/archive bulk actions

## 10. Reusability Strategy

### Form reuse

- Use `AppField` for field rendering and error display.
- Use `AppSubmitButton` for all mutation forms.
- Keep Zod schemas close to their feature domain.

### Table reuse

- Use `DataTable` for server-paginated list screens.
- Use `DataTableFilters`, `DataTableSearch`, and `DataTablePagination` for consistency.
- Keep page-specific columns in feature modules, not in the shared table wrapper.

### Modal and overlay reuse

- Use dialogs and drawers for create/edit flows where the action is low friction.
- Use confirmation dialogs for destructive changes.

### API and hook reuse

- Keep direct Axios calls inside client libraries and services, not in UI components.
- Reuse query key factories per domain.
- Reuse mutation hooks for cross-page write actions where possible.

### Utility reuse

- Keep route and auth helpers in `src/lib`.
- Keep token and cookie helpers centralized.
- Use the icon mapper for navigation and shell icons.

## 11. UI States

### Loading

- Use route-level loading components for page transitions.
- Use skeletons for dashboard cards, tables, and profile widgets.
- Use inline button loading states for form submissions.

### Empty states

- Empty tables should explain the current filter or search state.
- Empty account sections should prompt the user toward the next action.
- Empty cart should direct users back to catalog discovery once the storefront path is fully in place.

### Error handling

- Axios errors should pass through `parseAxiosError`.
- Validation errors should show field-level messages first.
- Authorization errors should redirect or display access-denied behavior.
- Network and backend failures should surface a retryable message where appropriate.

## 12. Refactoring Guidelines

### Duplicated logic to consolidate

- Auth redirect logic appears in multiple places and should remain consistent between `loginAction`, `proxy.ts`, and helper utilities.
- Several pages perform direct fetch and local refetch patterns that could be normalized into feature hooks.
- Dashboard, admin, and product list pages should converge on the same server-table pattern.
- Customer feature logic is already organized better than other domains and should be used as the reference structure.

### Safe extraction targets

- Move repeated query parameter serialization into shared helpers when a second module needs it.
- Move list-page server query state into reusable hooks only when multiple pages share identical behavior.
- Promote repeated account-state redirect checks into a single helper path.
- Extract mutation invalidation patterns into feature-scoped hooks when the same invalidations repeat across pages.

### Consistency improvements

- Keep route naming aligned with the as-built App Router tree.
- Avoid introducing new top-level folders unless the codebase already has a clear feature owner.
- Keep public storefront work separate from admin and customer account flows.

## 13. Implementation Roadmap

### Already done

- App Router layout structure
- Public/auth shell
- Protected dashboard shell
- Proxy-based auth and role guarding
- Token and cookie persistence helpers
- Axios client and error parsing layer
- TanStack Query provider with streamed hydration
- TanStack Form and Zod auth form pattern
- Shared table and form primitives
- Admin dashboard widgets and metrics reads
- Customer workspace for profile, address, loyalty, referrals, and reviews
- Admin customer management workspace
- Product management pages and components
- Order and payment read surfaces

### Needs refactor

- Consolidate overlapping auth redirect logic.
- Normalize service usage so UI pages call feature hooks more consistently.
- Decide whether `dashboard.services.ts` remains separate or is merged into admin service layers.
- Wire the logout action from the user dropdown to the real auth flow.
- Standardize all admin list pages on the same table state and query key pattern.

### Remains to build

- Full public storefront browsing experience.
- Complete cart-to-checkout-to-order placement UX.
- Finished customer-facing product detail and discovery flows.
- Any missing payment initiation and confirmation pages.
- Final pass on route naming and navigation labels so all shell routes match the current UI and backend contract.

### Priority order

1. Finish the authenticated customer purchase path from cart to order creation.
2. Normalize the shared data-fetching pattern around TanStack Query and feature hooks.
3. Wire remaining auth actions such as logout and any account-state redirects that are still partially stubbed.
4. Complete or formalize public storefront product discovery routes.
5. Remove or quarantine legacy non-Jersey admin modules that are not part of the current product scope.

## 14. Bottom Line

The current frontend already has the right foundations: App Router shells, cookie-backed auth, a proxy guard, shared HTTP clients, TanStack Query hydration, TanStack Form, TanStack Table, and a strong customer feature package. The remaining work is mostly completion and normalization, not structural reinvention. The safest path is to keep the current folder structure, finish the missing customer and storefront flows, and refactor only where a repeated pattern is clearly stable.
