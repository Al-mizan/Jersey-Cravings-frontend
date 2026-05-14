"use server";

import { registerZodSchema, IRegisterPayload } from "@/zod/auth.validation";
import { ILoginResponse } from "@/types/auth.types";
import { redirect } from "next/navigation";
import { httpClient } from "@/lib/axios/httpClient";
import { setTokenInCookies } from "@/lib/tokenUtils";
import {
    getDefaultDashboardRoute,
    isValidRedirectForRole,
    UserRole,
} from "@/lib/authUtils";

export const registerAction = async (
    payload: IRegisterPayload,
    redirectPath?: string,
) => {
    const parsedPayload = registerZodSchema.safeParse(payload);

    if (!parsedPayload.success) {
        const firstError =
            parsedPayload.error.issues[0]?.message || "Validation failed";
        return {
            success: false,
            message: firstError,
        };
    }
    let targetPath: string | null = null;
    try {
        const response = await httpClient.post<ILoginResponse>(
            "/auth/register",
            parsedPayload.data,
        );

        const { accessToken, refreshToken, user } = response.data;
        const { role, identifierVerified, identifier } = user;
        await setTokenInCookies("accessToken", accessToken);
        await setTokenInCookies("refreshToken", refreshToken);

        targetPath =
            redirectPath &&
            isValidRedirectForRole(redirectPath, role as UserRole)
                ? redirectPath
                : getDefaultDashboardRoute(role as UserRole);

    } catch (error: any) {
        console.log(error, "error");
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
            error.response.data.message === "Identifier not verified"
        ) {
            redirect(`/verify-email?identifier=${payload.identifier}`);
        }
        return {
            success: false,
            message:
                error.response?.data?.message ||
                error.message ||
                "Registration failed",
        };
    }
    if (targetPath) {
        redirect(targetPath);
    }
    return { success: false, message: "Unexpected error" };
};
