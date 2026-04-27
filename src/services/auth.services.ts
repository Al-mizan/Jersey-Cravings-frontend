"use server";

/**
 * Auth service layer - handles auth business logic and cookie management
 * All functions are server-only and handle token persistence
 */

import { authApiClient } from "@/lib/axios/authApiClient";
import { setTokenInCookies } from "@/lib/tokenUtils";
import {
    ILoginPayload,
    ILoginResponse,
    IRegisterPayload,
    IUserInfo,
    IVerifyEmailPayload,
    IForgetPasswordPayload,
    IResetPasswordPayload,
    IChangePasswordPayload,
} from "@/types/auth.types";
import { cookies } from "next/headers";

/**
 * Set auth tokens in cookies after login/registration
 */
async function setAuthTokens(
    accessToken: string,
    refreshToken: string,
    sessionToken: string,
): Promise<void> {
    await setTokenInCookies("accessToken", accessToken);
    await setTokenInCookies("refreshToken", refreshToken);
    await setTokenInCookies(
        "better-auth.session_token",
        sessionToken,
        24 * 60 * 60,
    ); // 1 day in seconds
}

/**
 * Clear all auth tokens from cookies
 */
async function clearAuthTokens(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
    cookieStore.delete("better-auth.session_token");
}

/**
 * Register a new customer account
 */
export async function registerUser(
    payload: IRegisterPayload,
): Promise<{ success: boolean; message: string; data?: ILoginResponse }> {
    try {
        const response = await authApiClient.register(payload);
        await setAuthTokens(
            response.accessToken,
            response.refreshToken,
            response.token,
        );
        return {
            success: true,
            message: "Registration successful",
            data: response,
        };
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Registration failed";
        return { success: false, message };
    }
}

/**
 * Login with email and password
 */
export async function loginUser(
    payload: ILoginPayload,
): Promise<{ success: boolean; message: string; data?: ILoginResponse }> {
    try {
        const response = await authApiClient.login(payload);
        await setAuthTokens(
            response.accessToken,
            response.refreshToken,
            response.token,
        );
        return { success: true, message: "Login successful", data: response };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Login failed";
        return { success: false, message };
    }
}

/**
 * Get current authenticated user info
 */
export async function getUserInfo(): Promise<IUserInfo | null> {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("accessToken")?.value;

        if (!accessToken) {
            return null;
        }

        const userInfo = await authApiClient.getMe();
        return userInfo;
    } catch (error) {
        console.error("Error fetching user info:", error);
        return null;
    }
}

/**
 * Refresh auth tokens
 */
export async function getNewTokensWithRefreshToken(
    refreshToken: string,
): Promise<boolean> {
    try {
        const response = await authApiClient.refreshToken();
        await setAuthTokens(
            response.accessToken,
            response.refreshToken,
            response.token,
        );
        return true;
    } catch (error) {
        console.error("Error refreshing token:", error);
        return false;
    }
}

/**
 * Logout current user and clear tokens
 */
export async function logoutUser(): Promise<{
    success: boolean;
    message: string;
}> {
    try {
        await authApiClient.logout();
        await clearAuthTokens();
        return { success: true, message: "Logout successful" };
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Logout failed";
        return { success: false, message };
    }
}

/**
 * Change password for current user
 */
export async function changePassword(
    payload: IChangePasswordPayload,
): Promise<{ success: boolean; message: string; data?: ILoginResponse }> {
    try {
        const response = await authApiClient.changePassword(payload);
        await setAuthTokens(
            response.accessToken,
            response.refreshToken,
            response.token,
        );
        return {
            success: true,
            message: "Password changed successfully",
            data: response,
        };
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Password change failed";
        return { success: false, message };
    }
}

/**
 * Verify email with OTP
 */
export async function verifyEmail(
    payload: IVerifyEmailPayload,
): Promise<{ success: boolean; message: string }> {
    try {
        await authApiClient.verifyEmail(payload);
        return { success: true, message: "Email verified successfully" };
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Email verification failed";
        return { success: false, message };
    }
}

/**
 * Request password reset OTP
 */
export async function forgetPassword(
    payload: IForgetPasswordPayload,
): Promise<{ success: boolean; message: string }> {
    try {
        await authApiClient.forgetPassword(payload);
        return { success: true, message: "OTP sent to your email" };
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Password reset request failed";
        return { success: false, message };
    }
}

/**
 * Reset password with OTP
 */
export async function resetPassword(
    payload: IResetPasswordPayload,
): Promise<{ success: boolean; message: string }> {
    try {
        await authApiClient.resetPassword(payload);
        await clearAuthTokens();
        return {
            success: true,
            message:
                "Password reset successful. Please login with your new password",
        };
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Password reset failed";
        return { success: false, message };
    }
}
