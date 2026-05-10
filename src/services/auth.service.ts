"use server";

import { setTokenInCookies } from "@/lib/tokenUtils";
import { cookies } from "next/headers";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BASE_API_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}


export async function getNewTokensWithRefreshToken(refreshToken: string): Promise<boolean> {
    try {
        const res = await fetch(`${BASE_API_URL}/auth/refresh-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: `refreshToken=${refreshToken}`
            }
        });

        if (!res.ok) {
            return false;
        }

        const { data } = await res.json();

        const { accessToken, refreshToken: newRefreshToken, token } = data;

        if (accessToken) {
            await setTokenInCookies("accessToken", accessToken);
        }

        if (newRefreshToken) {
            await setTokenInCookies("refreshToken", newRefreshToken);
        }

        return true;
    } catch (error) {
        console.error("Error refreshing token:", error);
        return false;
    }
}

export async function getUserInfo() {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("accessToken")?.value;

        if (!accessToken) {
            return null;
        }

        const res = await fetch(`${BASE_API_URL}/auth/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${accessToken}`
            }
        });

        if (!res.ok) {
            console.error("Failed to fetch user info:", res.status, res.statusText);
            return null;
        }

        const { data } = await res.json();

        return data;
    } catch (error) {
        console.error("Error fetching user info:", error);
        return null;
    }
}

export async function logout() {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get("refreshToken")?.value;

        if (refreshToken) {
            await fetch(`${BASE_API_URL}/auth/logout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Cookie: `refreshToken=${refreshToken}`
                }
            });
        }

        // Clear tokens from cookies
        await setTokenInCookies("accessToken", "", -1 /* expire immediately */);
        await setTokenInCookies("refreshToken", "", -1 /* expire immediately */);
    } catch (error) {
        console.error("Error during logout:", error);
    }
}

export async function verifyEmail(email: string, otp: string) {
    try {
        const res = await fetch(`${BASE_API_URL}/auth/verify-email`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, otp })
        });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body?.message || "Failed to verify email");
        }
        const { data } = await res.json();
        return data;
    } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error("Failed to verify email");
    }
}

export async function sendVerificationOtp(email: string) {
    try {
        const res = await fetch(`${BASE_API_URL}/auth/send-verification-otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body?.message || "Failed to send verification OTP");
        }
        return await res.json();
    } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error("Failed to send verification OTP");
    }
}