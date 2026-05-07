import jwt, { JwtPayload } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

import { httpClient } from "@/lib/axios/httpClient";

// Access tokens are short-lived — if no exp claim, assume 15 min
const ACCESS_TOKEN_FALLBACK_MAX_AGE = 60 * 15; // 15 minutes

// Refresh tokens are long-lived
const REFRESH_TOKEN_FALLBACK_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// better-auth session token — match your better-auth config (default is 7 days)
const SESSION_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const getTokenSecondsRemaining = (token: string): number => {
    if (!token) return 0;
    try {
        const tokenPayload = jwt.decode(token) as JwtPayload;

        if (!tokenPayload?.exp) {
            return 0;
        }

        const remainingSeconds =
            tokenPayload.exp - Math.floor(Date.now() / 1000);

        return remainingSeconds > 0 ? remainingSeconds : 0;
    } catch (error) {
        console.error("Error decoding token:", error);
        return 0;
    }
};

const isValidRedirectPath = (redirectPath: string | null) =>
    !!redirectPath &&
    redirectPath.startsWith("/") &&
    !redirectPath.startsWith("//");

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const redirectPath = url.searchParams.get("redirect");
    const error = url.searchParams.get("error");

    if (!code || error) {
        return NextResponse.redirect(
            new URL("/login?error=oauth_failed", request.url),
        );
    }

    try {
        const response = await httpClient.post<{
            accessToken: string;
            refreshToken: string;
            sessionToken: string;
        }>("/auth/exchange-oauth-code", { code });

        if (!response.success || !response.data) {
            return NextResponse.redirect(
                new URL("/login?error=oauth_failed", request.url),
            );
        }

        const { accessToken, refreshToken, sessionToken } = response.data;
        const targetPath = isValidRedirectPath(redirectPath)
            ? redirectPath
            : "/";

        const nextResponse = NextResponse.redirect(
            new URL(targetPath!, request.url),
        );
        const isProduction = process.env.NODE_ENV === "production";
        const cookieSameSite = isProduction ? "none" : "lax";

        const setCookie = (
            name: string,
            value: string,
            maxAgeInSeconds: number,
        ) => {
            nextResponse.cookies.set(name, value, {
                httpOnly: true,
                secure: isProduction,
                sameSite: cookieSameSite,
                path: "/",
                maxAge: maxAgeInSeconds,
            });
        };

        setCookie(
            "accessToken",
            accessToken,
            getTokenSecondsRemaining(accessToken) ||
                ACCESS_TOKEN_FALLBACK_MAX_AGE,
        );
        setCookie(
            "refreshToken",
            refreshToken,
            getTokenSecondsRemaining(refreshToken) ||
                REFRESH_TOKEN_FALLBACK_MAX_AGE,
        );
        setCookie(
            "better-auth.session_token",
            sessionToken,
            SESSION_TOKEN_MAX_AGE,
        );

        return nextResponse;
    } catch (error) {
        console.error("OAuth code exchange failed:", error);
        return NextResponse.redirect(
            new URL("/login?error=oauth_failed", request.url),
        );
    }
}
