/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import {
    getDefaultDashboardRoute,
    isValidRedirectForRole,
    UserRole,
} from "@/lib/authUtils";
import { httpClient } from "@/lib/axios/httpClient";
import { setTokenInCookies } from "@/lib/tokenUtils";
import { ApiErrorResponse } from "@/types/api.types";
import { ILoginResponse } from "@/types/auth.types";
import { ILoginPayload, loginZodSchema } from "@/zod/auth.validation";
import { redirect } from "next/navigation";

export const loginAction = async (
    payload: ILoginPayload,
    redirectPath?: string,
): Promise<ILoginResponse | ApiErrorResponse> => {
    const parsedPayload = loginZodSchema.safeParse(payload);

    if (!parsedPayload.success) {
        const firstError =
            parsedPayload.error.issues[0].message || "Invalid input";
        return {
            success: false,
            message: firstError,
        };
    }
    let targetPath: string | null = null;
    try {
        const response = await httpClient.post<ILoginResponse>(
            "/auth/login",
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

        console.log("Redirecting to:", targetPath);

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
            message: `Login failed: ${error.response?.status === 404 ? `API endpoint not found at ${process.env.NEXT_PUBLIC_API_BASE_URL}` : error.message}`,
        };
    }
    if (targetPath) {
        redirect(targetPath);
    }

    return { success: false, message: "Unexpected error" };
};
