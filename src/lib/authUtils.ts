import { UserRole } from "@/types/auth.types";

export const authRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
];

export const isAuthRoute = (pathname: string) => {
    return authRoutes.some((router: string) => router === pathname);
};

export type RouteConfig = {
    exact: string[];
    pattern: RegExp[];
};

/**
 * Protected routes accessible by all authenticated users
 */
export const commonProtectedRoutes: RouteConfig = {
    exact: ["/my-profile", "/change-password"],
    pattern: [],
};

/**
 * Admin dashboard routes (ADMIN, SUPER_ADMIN)
 */
export const adminProtectedRoutes: RouteConfig = {
    pattern: [/^\/admin\/dashboard/],
    exact: [],
};

/**
 * Customer dashboard routes
 */
export const customerProtectedRoutes: RouteConfig = {
    pattern: [/^\/dashboard/],
    exact: ["/cart", "/orders", "/wishlist"],
};

export const isRouteMatches = (pathname: string, routes: RouteConfig) => {
    if (routes.exact.includes(pathname)) {
        return true;
    }
    return routes.pattern.some((pattern: RegExp) => pattern.test(pathname));
};

export const getRouteOwner = (
    pathname: string,
): "SUPER_ADMIN" | "ADMIN" | "CUSTOMER" | "COMMON" | null => {
    if (isRouteMatches(pathname, adminProtectedRoutes)) {
        return "ADMIN";
    }

    if (isRouteMatches(pathname, customerProtectedRoutes)) {
        return "CUSTOMER";
    }

    if (isRouteMatches(pathname, commonProtectedRoutes)) {
        return "COMMON";
    }

    return null;
};

/**
 * Get default dashboard route based on user role
 */
export const getDefaultDashboardRoute = (role: UserRole): string => {
    if (role === "ADMIN" || role === "SUPER_ADMIN") {
        return "/admin/dashboard";
    }
    if (role === "CUSTOMER") {
        return "/dashboard";
    }

    return "/";
};

/**
 * Check if redirect path is valid for the given role
 */
export const isValidRedirectForRole = (
    redirectPath: string,
    role: UserRole,
): boolean => {
    const unifySuperAdminAndAdminRole = role === "SUPER_ADMIN" ? "ADMIN" : role;
    const normalizedRole = unifySuperAdminAndAdminRole;

    const sanitizedRedirectPath = redirectPath.split("?")[0] || redirectPath;
    const routeOwner = getRouteOwner(sanitizedRedirectPath);

    if (routeOwner === null || routeOwner === "COMMON") {
        return true;
    }

    if (routeOwner === normalizedRole) {
        return true;
    }

    return false;
};
