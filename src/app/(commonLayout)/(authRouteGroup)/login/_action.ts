/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

/**
 * Login server action - validates credentials and sets auth tokens
 * Handles account state redirects (email verification, password change)
 */

import { loginZodSchema, ILoginPayload } from "@/zod/auth.validation";
import { loginUser, getUserInfo } from "@/services/auth.services";
import {
    getAccountStateRedirect,
    buildAuthRedirectUrl,
} from "@/lib/authHelpers";
import {
    isValidRedirectForRole,
    getDefaultDashboardRoute,
} from "@/lib/authUtils";
import { ILoginResponse } from "@/types/auth.types";
import { ApiErrorResponse } from "@/types/api.types";
import { redirect } from "next/navigation";

export const loginAction = async (
    payload: ILoginPayload,
    redirectPath?: string,
): Promise<ILoginResponse | ApiErrorResponse> => {
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

        // Check if user needs to verify email or change password
        const accountStateRedirect = getAccountStateRedirect(userInfo, "/");
        if (accountStateRedirect) {
            redirect(accountStateRedirect);
        }

        // Determine final redirect destination with role-aware fallback
        const normalizedRole = userInfo.role;
        const isValidRedirect = isValidRedirectForRole(
            redirectPath || "",
            normalizedRole,
        );
        const targetPath = isValidRedirect
            ? redirectPath || getDefaultDashboardRoute(normalizedRole)
            : getDefaultDashboardRoute(normalizedRole);

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

        return {
            success: false,
            message: error instanceof Error ? error.message : "Login failed",
        };
    }
};
