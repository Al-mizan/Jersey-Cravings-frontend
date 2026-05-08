"use server";

import { logoutUser } from "@/services/auth.service";
import { ApiErrorResponse } from "@/types/api.types";

export interface LogoutActionResponse {
    success: boolean;
    message: string;
}

export async function logoutAction(): Promise<
    LogoutActionResponse | ApiErrorResponse
> {
    const result = await logoutUser();
    return {
        success: result.success,
        message: result.message,
    };
}
