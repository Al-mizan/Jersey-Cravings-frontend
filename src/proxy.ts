import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@/types/auth.types";
import {
    getAccountStateRedirect,
    jwtUtils,
    isTokenExpiringSoon,
} from "@/lib/auth";
import {
    getNewTokensWithRefreshToken,
    getUserInfo,
} from "@/services/auth.services";
import {
    AUTH_ROUTES,
    PUBLIC_ROUTES,
    CUSTOMER_PROTECTED_ROUTES,
    ADMIN_PROTECTED_ROUTES,
    matchRoute,
    getDefaultDashboardRoute,
    createRedirectWithParams,
} from "./lib/auth/authUtils";

/**
 * Attempt to refresh the access token using refresh token
 */
async function refreshTokenMiddleware(refreshToken: string): Promise<boolean> {
    try {
        const refresh = await getNewTokensWithRefreshToken(refreshToken);
        return !!refresh;
    } catch (error) {
        console.error("Error refreshing token in middleware:", error);
        return false;
    }
}

const getRouteOwner = (pathname: string): "ADMIN" | "CUSTOMER" | null => {
    if (matchRoute(pathname, ADMIN_PROTECTED_ROUTES)) {
        return "ADMIN";
    }

    if (matchRoute(pathname, CUSTOMER_PROTECTED_ROUTES)) {
        return "CUSTOMER";
    }

    return null;
};

export async function proxy(request: NextRequest) {
    try {
        const { pathname, search } = request.nextUrl;
        const pathWithQuery = `${pathname}${search}`;
        const accessToken = request.cookies.get("accessToken")?.value;
        const refreshToken = request.cookies.get("refreshToken")?.value;
        const requestHeaders = new Headers(request.headers);

        const accessSecret = process.env.JWT_ACCESS_SECRET as string;
        const accessTokenPayload = accessToken
            ? jwtUtils.verifyToken(accessToken, accessSecret)
            : null;
        const isValidAccessToken = Boolean(accessTokenPayload?.success);
        const decodedAccessToken = accessTokenPayload?.data ?? null;

        let userRole: UserRole | null = decodedAccessToken?.role ?? null;
        if (userRole === "SUPER_ADMIN") {
            userRole = "ADMIN";
        }

        const isAuthRoute = matchRoute(pathname, AUTH_ROUTES);
        const isPublicRoute = matchRoute(pathname, PUBLIC_ROUTES);
        const routeOwner = getRouteOwner(pathname);

        if (
            accessToken &&
            refreshToken &&
            isValidAccessToken &&
            (await isTokenExpiringSoon(accessToken))
        ) {
            try {
                const refreshed = await refreshTokenMiddleware(refreshToken);
                if (refreshed) {
                    requestHeaders.set("x-token-refreshed", "1");
                }
            } catch (error) {
                console.error("Error refreshing token:", error);
            }
        }

        const allowRequest = () =>
            NextResponse.next({
                request: { headers: requestHeaders },
            });

        // Rule 1: Logged-in users should not access auth pages (except verify/reset)
        if (
            isAuthRoute &&
            isValidAccessToken &&
            pathname !== "/verify-email" &&
            pathname !== "/reset-password"
        ) {
            return NextResponse.redirect(
                new URL(getDefaultDashboardRoute(userRole), request.url),
            );
        }

        // Rule 2: Reset password handling
        if (pathname === "/reset-password") {
            const email = request.nextUrl.searchParams.get("email");

            if (isValidAccessToken && email) {
                const userInfo = await getUserInfo();

                if (userInfo?.needPasswordChange) {
                    return allowRequest();
                }

                return NextResponse.redirect(
                    new URL(getDefaultDashboardRoute(userRole), request.url),
                );
            }

            if (email) {
                return allowRequest();
            }

            return createRedirectWithParams(request, "/login", {
                redirect: pathWithQuery,
            });
        }

        // Allow unauthenticated users on auth routes
        if (isAuthRoute && !isValidAccessToken) {
            return allowRequest();
        }

        // Rule 3: Public routes are always allowed
        if (isPublicRoute) {
            return allowRequest();
        }

        // Allow unprotected routes
        if (routeOwner === null && !isAuthRoute) {
            return allowRequest();
        }

        // Rule 4: Protected routes require authentication
        if (!accessToken || !isValidAccessToken) {
            return createRedirectWithParams(request, "/login", {
                redirect: pathWithQuery,
            });
        }

        const userInfo = await getUserInfo();

        if (userInfo) {
            const accountStateRedirect = getAccountStateRedirect(
                userInfo,
                pathname,
            );

            if (accountStateRedirect) {
                return NextResponse.redirect(
                    new URL(accountStateRedirect, request.url),
                );
            }

            if (pathname === "/verify-email" && userInfo.emailVerified) {
                return NextResponse.redirect(
                    new URL(getDefaultDashboardRoute(userRole), request.url),
                );
            }

            if (
                pathname === "/reset-password" &&
                !userInfo.needPasswordChange
            ) {
                return NextResponse.redirect(
                    new URL(getDefaultDashboardRoute(userRole), request.url),
                );
            }
        }

        // Rule 5: Role-based protected routes
        if (routeOwner === "ADMIN" && userRole !== "ADMIN") {
            return NextResponse.redirect(
                new URL(getDefaultDashboardRoute(userRole), request.url),
            );
        }

        if (routeOwner === "CUSTOMER" && userRole !== "CUSTOMER") {
            return NextResponse.redirect(
                new URL(getDefaultDashboardRoute(userRole), request.url),
            );
        }

        return allowRequest();
    } catch (error) {
        console.error("Error in proxy middleware:", error);
        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)",
    ],
};
