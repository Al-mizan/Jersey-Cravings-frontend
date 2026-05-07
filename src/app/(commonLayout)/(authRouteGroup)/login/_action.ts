/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

/**
 * Login server action - validates credentials and sets auth tokens
 * Handles account state redirects (email verification, password change)
 */

import { loginZodSchema, ILoginPayload } from "@/zod/auth.validation";
import { loginUser, getUserInfo } from "@/services/auth.services";
import { resolvePostAuthRedirectPath } from "@/lib/auth";
import { ILoginResponse } from "@/types/auth.types";
import { ApiErrorResponse } from "@/types/api.types";
import { redirect } from "next/navigation";

export const loginAction = async (
    payload: ILoginPayload,
    redirectPath?: string,
) => {
    const parsedPayload = loginZodSchema.safeParse(payload);

    if (!parsedPayload.success) {
        const firstError =
            parsedPayload.error.issues[0]?.message || "Invalid input";
        return {
            success: false,
            message: firstError,
        };
    }

    try {
        // Call auth service to login and set tokens
        const result = await loginUser(parsedPayload.data);
        if (!result.success) {
            return {
                success: false,
                message: result.message,
            };
        }

        // Get current user info to check account state
        const userInfo = await getUserInfo();
        if (!userInfo) {
            return {
                success: false,
                message: "Failed to fetch user information",
            };
        }

        // console.log(userInfo, "user info from login action");

        const targetPath = resolvePostAuthRedirectPath(userInfo, redirectPath);
        redirect(targetPath);
    } catch (error: any) {
        if (
            error &&
            typeof error === "object" &&
            "digest" in error &&
            typeof error.digest === "string" &&
            error.digest.startsWith("NEXT_REDIRECT")
        ) {
            throw error;
        }

        if (
            error &&
            error.response &&
            error.response.data.message === "Email not verified"
        ) {
            redirect(`/verify-email?email=${payload.email}`);
        }
        return {
            success: false,
            message: `Login failed: ${error.response?.status === 404 ? `API endpoint not found at ${process.env.NEXT_PUBLIC_API_BASE_URL}` : error.message}`,
        };
    }
};
