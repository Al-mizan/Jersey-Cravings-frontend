"use server";

/**
 * Verify email server action - verifies email with OTP
 */

import {
    verifyEmailZodSchema,
    IVerifyEmailPayload,
} from "@/zod/auth.validation";
import { verifyEmail, getUserInfo } from "@/services/auth.services";
import { getDefaultDashboardRoute } from "@/lib/authUtils";
import { ApiErrorResponse } from "@/types/api.types";
import { redirect } from "next/navigation";

export const verifyEmailAction = async (
    payload: IVerifyEmailPayload,
): Promise<{ success: boolean; message: string }> => {
    const parsedPayload = verifyEmailZodSchema.safeParse(payload);

    if (!parsedPayload.success) {
        const firstError =
            parsedPayload.error.issues[0]?.message || "Validation failed";
        return {
            success: false,
            message: firstError,
        };
    }

    try {
        // Call auth service to verify email
        const result = await verifyEmail(parsedPayload.data);
        if (!result.success) {
            return {
                success: false,
                message: result.message,
            };
        }

        // Get updated user info
        const userInfo = await getUserInfo();
        if (!userInfo) {
            return {
                success: false,
                message: "Failed to fetch user information",
            };
        }

        // Check if password change is required
        if (userInfo.needPasswordChange) {
            redirect(
                `/reset-password?email=${encodeURIComponent(userInfo.email)}`,
            );
        }

        // Redirect to dashboard
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
                error instanceof Error
                    ? error.message
                    : "Email verification failed",
        };
    }
};
