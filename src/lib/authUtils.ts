export type UserRole = "SUPER_ADMIN" | "ADMIN" | "CUSTOMER";

export const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];

export const isAuthRoute = (pathname: string) => {
    return authRoutes.some((router: string) => router === pathname);
}

export type RouteConfig = {
    exact: string[],
    pattern: RegExp[]
}

// todo: public routes can be accessed by both admin and customer, but we can have some routes that are only for customers but not for admins, and vice versa. We can have a separate config for that as well if needed in the future.

// Public routes - accessible without authentication
export const PUBLIC_ROUTES: RouteConfig = {
    exact: [
        "/",
        "/search",
    ],
    pattern: [
        /^\/products/,
        /^\/categories/,
    ],
};

export const commonProtectedRoutes: RouteConfig = {
    exact: ["/my-profile", "/change-password"],
    pattern: []
}


export const adminProtectedRoutes: RouteConfig = {
    pattern: [/^\/admin\/dashboard/], // Matches any path that starts with /admin/dashboard
    exact: []
}


export const CUSTOMER_PROTECTED_ROUTES: RouteConfig = {
    exact: [
        "/logout",
        "/payment/success"
    ],
    pattern: [
        /^\/carts/,
        /^\/checkout/,
        /^\/orders/,
        /^\/my-section/,
        /^\/account/,
        /^\/reviews/,
        /^\/points/,
        /^\/referral-code/,
    ],
};

export const isRouteMatches = (pathname: string, routes: RouteConfig) => {
    if (routes.exact.includes(pathname)) {
        return true;
    }
    return routes.pattern.some((pattern: RegExp) => pattern.test(pathname));
}

export const getRouteOwner = (pathname: string): "SUPER_ADMIN" | "ADMIN" | "CUSTOMER" | "COMMON" | null => {

    // if (isRouteMatches(pathname, superAdminProtectedRoutes)) {
    //     return "SUPER_ADMIN";
    // }

    if (isRouteMatches(pathname, adminProtectedRoutes)) {
        return "ADMIN";
    }

    if (isRouteMatches(pathname, CUSTOMER_PROTECTED_ROUTES)) {
        return "CUSTOMER";
    }

    if (isRouteMatches(pathname, commonProtectedRoutes)) {
        return "COMMON";
    }

    return null; // public route
}

export const getDefaultDashboardRoute = (role: UserRole) => {
    if (role === "ADMIN" || role === "SUPER_ADMIN") {
        return "/admin/dashboard";
    }
    if (role === "CUSTOMER") {
        return "/";
    }

    return "/";
}

export const isValidRedirectForRole = (redirectPath: string, role: UserRole) => {
    const unifySuperAdminAndAdminRole = role === "SUPER_ADMIN" ? "ADMIN" : role;

    role = unifySuperAdminAndAdminRole;

    const sanitizedRedirectPath = redirectPath.split("?")[0] || redirectPath;
    const routeOwner = getRouteOwner(sanitizedRedirectPath);

    if (routeOwner === null || routeOwner === "COMMON") {
        return true;
    }

    if (routeOwner === role) {
        return true;
    }

    return false;
}