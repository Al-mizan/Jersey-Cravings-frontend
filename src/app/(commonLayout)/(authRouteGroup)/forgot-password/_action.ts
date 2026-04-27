"use server";

/**
 * Forgot password server action - requests password reset OTP
 */

import {
    forgetPasswordZodSchema,
    IForgetPasswordPayload,
} from "@/zod/auth.validation";
import { forgetPassword } from "@/services/auth.services";
import { ApiErrorResponse } from "@/types/api.types";

export const forgetPasswordAction = async (
    payload: IForgetPasswordPayload,
): Promise<{ success: boolean; message: string }> => {
    const parsedPayload = forgetPasswordZodSchema.safeParse(payload);

    if (!parsedPayload.success) {
        const firstError =
            parsedPayload.error.issues[0]?.message || "Validation failed";
        return {
            success: false,
            message: firstError,
        };
    }

    try {
        // Call auth service to request password reset
        const result = await forgetPassword(parsedPayload.data);
        if (!result.success) {
            return {
                success: false,
                message: result.message,
            };
        }

        return {
            success: true,
            message: "OTP sent to your email. Please check your inbox.",
        };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Password reset request failed",
        };
    }
};
