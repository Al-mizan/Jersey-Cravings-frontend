"use server"

import jwt, { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";

const setCookie = async (
    name: string,
    value: string,
    maxAgeInSeconds: number,
) => {
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === "production";
    const cookieSameSite = isProduction ? "none" : "lax";

    cookieStore.set(name, value, {
        httpOnly: true,
        secure: isProduction,
        sameSite: cookieSameSite,
        path: "/",
        maxAge: maxAgeInSeconds,
    });
};

const getTokenSecondsRemaining = (token: string): number => {
    if (!token) return 0;
    try {
        const tokenPayload = jwt.decode(token) as JwtPayload;

        if (tokenPayload && !tokenPayload.exp) {
            return 0;
        }

        const remainingSeconds =
            (tokenPayload.exp as number) - Math.floor(Date.now() / 1000);

        return remainingSeconds > 0 ? remainingSeconds : 0;
    } catch (error) {
        console.error("Error decoding token:", error);
        return 0;
    }
};

export const setTokenInCookies = async (
    name: string,
    token: string,
    fallbackMaxAgeInSeconds = 60 * 60 * 24, // 1 day
) => {
    let maxAgeInSeconds: number | undefined;

    if (name !== "better-auth.session_token") {
        maxAgeInSeconds = getTokenSecondsRemaining(token);
    }

    await setCookie(
        name,
        token,
        maxAgeInSeconds ?? fallbackMaxAgeInSeconds,
    );
};

export async function isTokenExpiringSoon(
    token: string,
    thresholdInSeconds = 300,
): Promise<boolean> {
    const remainingSeconds = getTokenSecondsRemaining(token);
    return remainingSeconds > 0 && remainingSeconds <= thresholdInSeconds;
}

