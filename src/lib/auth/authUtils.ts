import { NextRequest, NextResponse } from "next/server";
import type { ISessionData, UserRole } from "@/types/auth.types";

type RouteConfig = {
    exact: string[];
    prefix: string[];
};

export const SESSION_COOKIE_NAME = "better-auth.session_token";
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Public routes - accessible without authentication
export const PUBLIC_ROUTES: RouteConfig = {
    exact: [
        "/",
        "/search",
        "/cart",
    ],
    prefix: [
        "/products",
        "/categories",
    ],
};

// Auth routes - only for unauthenticated users
export const AUTH_ROUTES: RouteConfig = {
    exact: [
        "/login",
        "/register",
        "/forgot-password",
        "/verify-email",
    ],
    prefix: [],
};

// Customer protected routes - require authentication (any role)
export const CUSTOMER_PROTECTED_ROUTES: RouteConfig = {
    exact: [
        "/logout",
    ],
    prefix: [
        "/checkout",
        "/orders",
        "/my-section",
        "/account",
    ],
};

// Admin protected routes - require ADMIN or SUPER_ADMIN
export const ADMIN_PROTECTED_ROUTES: RouteConfig = {
    exact: [
        "/reset-password",
    ],
    prefix: [
        "/admin",
    ],
};

/**
 * Match a pathname against route configuration
 * Returns true if pathname matches exact or prefix patterns
 */
export const matchRoute = (pathname: string, routes: RouteConfig): boolean => {
    if (routes.exact.includes(pathname)) {
        return true;
    }

    return routes.prefix.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
};

/**
 * Get default dashboard route based on user role
 */
export const getDefaultDashboardRoute = (role: UserRole | null): string => {
    if (role === "ADMIN" || role === "SUPER_ADMIN") {
        return "/admin/dashboard";
    }
    return "/";
};

/**
 * Extract token from request (Bearer token or cookie)
 */
export const getToken = (request: NextRequest): string | null => {
    const authorization = request.headers.get("authorization");
    if (authorization?.startsWith("Bearer ")) {
        return authorization;
    }

    return request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
};

/**
 * Fetch session data from API
 */
export const getSession = async (
    token: string | null,
): Promise<ISessionData | null> => {
    if (!API_BASE_URL) {
        console.error("NEXT_PUBLIC_API_BASE_URL is not defined");
        return null;
    }

    if (!token) {
        return null;
    }

    const headers = new Headers({
        Accept: "application/json",
    });

    if (token.startsWith("Bearer ")) {
        headers.set("Authorization", token);
    } else {
        headers.set("Cookie", `${SESSION_COOKIE_NAME}=${token}`);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
            method: "GET",
            headers,
            cache: "no-store",
        });

        if (!response.ok) {
            return null;
        }

        const payload = (await response.json()) as
            | ISessionData
            | { data?: ISessionData };

        if (payload && "session" in payload && "user" in payload) {
            return payload as ISessionData;
        }

        if (payload && "data" in payload && payload.data) {
            return payload.data;
        }

        return null;
    } catch (error) {
        console.error("Error fetching session in middleware:", error);
        return null;
    }
};

/**
 * Create redirect response with query parameters
 */
export const createRedirectWithParams = (
    request: NextRequest,
    path: string,
    params: Record<string, string>,
): NextResponse => {
    const url = new URL(path, request.url);
    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            url.searchParams.set(key, value);
        }
    });
    return NextResponse.redirect(url);
};