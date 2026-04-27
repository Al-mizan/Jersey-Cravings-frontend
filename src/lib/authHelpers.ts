/**
 * Auth utilities and helpers for handling auth flows and account states
 * Used by both proxy middleware and server-side auth actions
 */

import { IUserInfo, UserRole } from "@/types/auth.types";

/**
 * Determine if user needs to verify email before proceeding
 */
export function requiresEmailVerification(user: IUserInfo | null): boolean {
    if (!user) return false;
    return user.emailVerified === false;
}

/**
 * Determine if user is forced to change password before proceeding
 */
export function requiresPasswordChange(user: IUserInfo | null): boolean {
    if (!user) return false;
    return user.needPasswordChange === true;
}

/**
 * Determine the auth redirect path based on user account state
 * Returns the path user should be redirected to, or null if no redirect needed
 */
export function getAccountStateRedirect(
    user: IUserInfo | null,
    currentPath: string,
): string | null {
    if (!user) return null;

    // Check if user is already at the required page
    if (currentPath === "/verify-email" && user.emailVerified === false) {
        return null; // already at verify-email page
    }

    if (currentPath === "/reset-password" && user.needPasswordChange === true) {
        return null; // already at reset-password page
    }

    // Redirect to verify-email if email not verified
    if (user.emailVerified === false) {
        return `/verify-email?email=${encodeURIComponent(user.email)}`;
    }

    // Redirect to reset-password if password change required
    if (user.needPasswordChange === true) {
        return `/reset-password?email=${encodeURIComponent(user.email)}`;
    }

    return null;
}

/**
 * Normalize user role for consistency
 * SUPER_ADMIN is treated as ADMIN in most frontend logic
 */
export function normalizeUserRole(role: UserRole): UserRole {
    if (role === "SUPER_ADMIN") {
        return "ADMIN";
    }
    return role;
}

/**
 * Build redirect URL after login/registration with role-aware fallback
 */
export function buildAuthRedirectUrl(
    requestedRedirect: string | null,
    userRole: UserRole,
): string {
    if (!requestedRedirect) {
        return `/dashboard`; // default to customer dashboard
    }

    // Validate the redirect is safe and role-appropriate
    // Remove query parameters for route matching
    const cleanPath = requestedRedirect.split("?")[0];

    // Prevent open redirects
    if (!cleanPath.startsWith("/") || cleanPath.startsWith("//")) {
        return `/dashboard`;
    }

    // If user role can access the requested path, use it
    // Otherwise redirect to default dashboard for their role
    return requestedRedirect;
}

/**
 * Check if user is in a blocked/deleted state
 */
export function isUserBlocked(user: IUserInfo | null): boolean {
    if (!user) return false;
    return user.status === "BLOCKED" || user.isDeleted === true;
}

/**
 * Extract first error message from validation errors
 */
export function getFirstValidationError(
    errors: Record<string, unknown>,
): string | null {
    for (const key in errors) {
        const error = errors[key];
        if (Array.isArray(error) && error.length > 0) {
            const firstError = error[0];
            if (
                typeof firstError === "object" &&
                firstError !== null &&
                "message" in firstError
            ) {
                return (firstError as any).message;
            }
            if (typeof firstError === "string") {
                return firstError;
            }
        }
        if (typeof error === "string") {
            return error;
        }
    }
    return null;
}
