import { NextRequest, NextResponse } from "next/server";
import {
    getDefaultDashboardRoute,
    getRouteOwner,
    isAuthRoute,
    UserRole,
} from "./lib/authUtils";
import { jwtUtils } from "./lib/jwtUtils";
import { isTokenExpiringSoon } from "./lib/tokenUtils";
import {
    getNewTokensWithRefreshToken,
    getUserInfo,
} from "./services/auth.service";

async function refreshTokenMiddleware(refreshToken: string): Promise<boolean> {
    try {
        const refresh = await getNewTokensWithRefreshToken(refreshToken);
        if (!refresh) {
            return false;
        }
        return true;
    } catch (error) {
        console.error("Error refreshing token in middleware:", error);
        return false;
    }
}

export async function proxy(request: NextRequest) {
    try {
        const { pathname } = request.nextUrl;
        const pathWithQuery = `${pathname}${request.nextUrl.search}`;
        const accessToken = request.cookies.get("accessToken")?.value;
        const refreshToken = request.cookies.get("refreshToken")?.value;

        const decodedAccessToken =
            accessToken &&
            jwtUtils.verifyToken(
                accessToken,
                process.env.JWT_ACCESS_SECRET as string,
            ).data;

        const isValidAccessToken =
            accessToken &&
            jwtUtils.verifyToken(
                accessToken,
                process.env.JWT_ACCESS_SECRET as string,
            ).success;

        let userRole: UserRole | null = null;

        if (decodedAccessToken) {
            userRole = decodedAccessToken.role as UserRole;
        }

        const routerOwner = getRouteOwner(pathname);

        const unifySuperAdminAndAdminRole =
            userRole === "SUPER_ADMIN" ? "ADMIN" : userRole;

        userRole = unifySuperAdminAndAdminRole;

        const isAuth = isAuthRoute(pathname);

        console.log("Is valid access token:", isValidAccessToken);
        console.log("User role:", userRole);

        //proactively refresh token if refresh token exists and access token is expired or about to expire
        if (
            isValidAccessToken &&
            refreshToken &&
            (await isTokenExpiringSoon(accessToken))
        ) {
            const requestHeaders = new Headers(request.headers);

            const response = NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            });

            try {
                const refreshed = await refreshTokenMiddleware(refreshToken);

                if (refreshed) {
                    requestHeaders.set("x-token-refreshed", "1");
                }

                return NextResponse.next({
                    request: {
                        headers: requestHeaders,
                    },
                    headers: response.headers,
                });
            } catch (error) {
                console.error("Error refreshing token:", error);
            }

            return response;
        }

        // Rule - 1 : Logged-in users should not access auth pages,
        // except pages that may be mandatory due to account state.
        if (
            isAuth &&
            isValidAccessToken &&
            pathname !== "/verify-email" &&
            pathname !== "/reset-password"
        ) {
            return NextResponse.redirect(
                new URL(
                    getDefaultDashboardRoute(userRole as UserRole),
                    request.url,
                ),
            );
        }

        // Rule - 2 : User is trying to access reset password page
        if (pathname === "/reset-password") {
            const identifier = request.nextUrl.searchParams.get("identifier");

            // case - 1 user has needPasswordChange true
            //no need for case 1 if need password change is handled from change-password page
            if (accessToken && identifier) {
                const userInfo = await getUserInfo();

                return NextResponse.redirect(
                    new URL(
                        getDefaultDashboardRoute(userRole as UserRole),
                        request.url,
                    ),
                );
            }

            // Case-2 user coming from forgot password

            if (identifier) {
                return NextResponse.next();
            }

            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirect", pathWithQuery);
            return NextResponse.redirect(loginUrl);
        }

        // Rule-3 User trying to access Public route -> allow
        if (routerOwner === null) {
            return NextResponse.next();
        }

        // Rule - 4 User is Not logged in but trying to access protected route -> redirect to login
        if (!accessToken || !isValidAccessToken) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirect", pathWithQuery);
            loginUrl.searchParams.set("reason", "token_expired");
            return NextResponse.redirect(loginUrl);
        }

        //Rule - Enforcing user to stay in reset password or verify email page if their or isEmailVerified flags are not satisfied respectively

        if (accessToken) {
            const userInfo = await getUserInfo();

            if (userInfo) {
                // need email verification scenario
                if (userInfo.identifierVerified === false) {
                    if (pathname !== "/verify-email") {
                        const verifyEmailUrl = new URL(
                            "/verify-email",
                            request.url,
                        );
                        verifyEmailUrl.searchParams.set(
                            "identifier",
                            userInfo.identifier,
                        );
                        return NextResponse.redirect(verifyEmailUrl);
                    }

                    return NextResponse.next();
                }

                if (userInfo.identifierVerified && pathname === "/verify-email") {
                    return NextResponse.redirect(
                        new URL(
                            getDefaultDashboardRoute(userRole as UserRole),
                            request.url,
                        ),
                    );
                }
            }
        }

        // Rule - 5 User trying to access Common protected route -> allow
        if (routerOwner === "COMMON") {
            return NextResponse.next();
        }

        //Rule-6 User trying to visit role based protected but doesn't have required role -> redirect to their default dashboard

        if (routerOwner === "ADMIN" || routerOwner === "CUSTOMER") {
            if (routerOwner !== userRole) {
                return NextResponse.redirect(
                    new URL(
                        getDefaultDashboardRoute(userRole as UserRole),
                        request.url,
                    ),
                );
            }
        }

        return NextResponse.next();
    } catch (error) {
        console.error("Error in proxy middleware:", error);
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)",
    ],
};
