"use server";

/**
 * Reset password server action - resets password with OTP
 * After reset, user is logged out and must login with new password
 */

import {
    resetPasswordZodSchema,
    IResetPasswordPayload,
} from "@/zod/auth.validation";
import { resetPassword } from "@/services/auth.service";
import { ApiErrorResponse } from "@/types/api.types";
import { redirect } from "next/navigation";

export const resetPasswordAction = async (
    payload: IResetPasswordPayload,
): Promise<{ success: boolean; message: string }> => {
    const parsedPayload = resetPasswordZodSchema.safeParse(payload);

    if (!parsedPayload.success) {
        const firstError =
            parsedPayload.error.issues[0]?.message || "Validation failed";
        return {
            success: false,
            message: firstError,
        };
    }

    try {
        // Call auth service to reset password
        const result = await resetPassword(parsedPayload.data);
        if (!result.success) {
            return {
                success: false,
                message: result.message,
            };
        }

        // Redirect to login page after successful reset
        redirect(
            "/login?message=Password%20reset%20successful.%20Please%20login%20with%20your%20new%20password",
        );
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
                    : "Password reset failed",
        };
    }
};
