"use server";

/**
 * Register server action - creates new customer account
 */

import { registerZodSchema, IRegisterPayload } from "@/zod/auth.validation";
import { registerUser, getUserInfo } from "@/services/auth.services";
import { getAccountStateRedirect } from "@/lib/authHelpers";
import { getDefaultDashboardRoute } from "@/lib/authUtils";
import { ILoginResponse } from "@/types/auth.types";
import { ApiErrorResponse } from "@/types/api.types";
import { redirect } from "next/navigation";

export const registerAction = async (
    payload: IRegisterPayload,
): Promise<ILoginResponse | ApiErrorResponse> => {
    const parsedPayload = registerZodSchema.safeParse(payload);

    if (!parsedPayload.success) {
        const firstError =
            parsedPayload.error.issues[0]?.message || "Validation failed";
        return {
            success: false,
            message: firstError,
        };
    }

    try {
        // Call auth service to register
        const result = await registerUser(parsedPayload.data);
        if (!result.success) {
            return {
                success: false,
                message: result.message,
            };
        }

        // Get current user info
        const userInfo = await getUserInfo();
        if (!userInfo) {
            return {
                success: false,
                message: "Failed to fetch user information",
            };
        }

        // Check for account state redirects (typically email verification for new accounts)
        const accountStateRedirect = getAccountStateRedirect(userInfo, "/");
        if (accountStateRedirect) {
            redirect(accountStateRedirect);
        }

        // Redirect to default dashboard
        redirect(getDefaultDashboardRoute(userInfo.role));
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
            message:
                error instanceof Error ? error.message : "Registration failed",
        };
    }
};
