import type { IUserInfo, UserRole } from "@/types/auth.types";
import {
    ADMIN_PROTECTED_ROUTES,
    CUSTOMER_PROTECTED_ROUTES,
    matchRoute,
    getDefaultDashboardRoute,
} from "./authUtils";

/**
 * Normalize user role (SUPER_ADMIN -> ADMIN)
 */
const normalizeUserRole = (role: UserRole): "ADMIN" | "CUSTOMER" => {
    return role === "SUPER_ADMIN" ? "ADMIN" : role;
};

/**
 * Get route owner type based on pathname
 */
const getRouteOwner = (
    pathname: string,
): "ADMIN" | "CUSTOMER" | null => {
    if (matchRoute(pathname, ADMIN_PROTECTED_ROUTES)) {
        return "ADMIN";
    }

    if (matchRoute(pathname, CUSTOMER_PROTECTED_ROUTES)) {
        return "CUSTOMER";
    }

    return null;
};

/**
 * Check if redirect path is valid for the given role
 */
export function isValidRedirectForRole(
    redirectPath: string,
    role: UserRole,
): boolean {
    const normalizedRole = normalizeUserRole(role);
    const sanitizedPath = redirectPath.split("?")[0] || redirectPath;
    const routeOwner = getRouteOwner(sanitizedPath);

    // If route has no specific owner, it's valid for everyone
    if (routeOwner === null) {
        return true;
    }

    // Route owner must match user role
    return routeOwner === normalizedRole;
}

/**
 * Determine if user needs to complete account setup
 */
export function getAccountStateRedirect(
    user: IUserInfo | null,
    currentPath: string,
): string | null {
    if (!user) return null;

    // Don't redirect if already on the required page
    if (currentPath === "/verify-email" && !user.emailVerified) {
        return null;
    }

    if (currentPath === "/reset-password" && user.needPasswordChange) {
        return null;
    }

    // Redirect to verify-email if needed
    if (!user.emailVerified) {
        return `/verify-email?email=${encodeURIComponent(user.email)}`;
    }

    // Redirect to reset-password if needed
    if (user.needPasswordChange) {
        return `/reset-password?email=${encodeURIComponent(user.email)}`;
    }

    return null;
}

/**
 * Resolve final redirect path after successful authentication
 */
export function resolvePostAuthRedirectPath(
    user: IUserInfo,
    requestedRedirect?: string,
): string {
    // Account state takes priority
    const accountStateRedirect = getAccountStateRedirect(user, "/");
    if (accountStateRedirect) {
        return accountStateRedirect;
    }

    const normalizedRole = normalizeUserRole(user.role);

    // Use requested redirect if valid for user's role
    if (
        requestedRedirect &&
        isValidRedirectForRole(requestedRedirect, normalizedRole)
    ) {
        return requestedRedirect;
    }

    // Fallback to default dashboard
    return getDefaultDashboardRoute(normalizedRole);
}