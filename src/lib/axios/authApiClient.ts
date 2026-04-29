/**
 * Auth API client - handles all auth endpoints with the backend
 * All methods handle request/response serialization and error normalization
 */

import { httpClient } from "./httpClient";
import {
    ILoginPayload,
    ILoginResponse,
    IRegisterPayload,
    IRefreshTokenResponse,
    IVerifyEmailPayload,
    IForgetPasswordPayload,
    IResetPasswordPayload,
    IChangePasswordPayload,
    IUserInfo,
    ILogoutResponse,
    IApiResponse,
} from "@/types/auth.types";

const AUTH_ENDPOINT = "/auth";

class AuthApiClient {
    /**
     * Register a new customer
     */
    async register(payload: IRegisterPayload): Promise<ILoginResponse> {
        try {
            const response = await httpClient.post<ILoginResponse>(
                `${AUTH_ENDPOINT}/register`,
                payload,
            );

            if (!response.success || !response.data) {
                throw new Error(response.message || "Registration failed");
            }

            return response.data;
        } catch (error) {
            throw this.normalizeError(error, "Registration failed");
        }
    }

    /**
     * Login with email and password
     */
    async login(payload: ILoginPayload): Promise<ILoginResponse> {
        try {
            const response = await httpClient.post<ILoginResponse>(
                `${AUTH_ENDPOINT}/login`,
                payload,
            );

            if (!response.success || !response.data) {
                throw new Error(response.message || "Login failed");
            }

            return response.data;
        } catch (error) {
            throw this.normalizeError(error, "Login failed");
        }
    }

    /**
     * Get current authenticated user info
     */
    async getMe(): Promise<IUserInfo> {
        try {
            const response = await httpClient.get<IUserInfo>(
                `${AUTH_ENDPOINT}/me`,
            );

            if (!response.success || !response.data) {
                throw new Error(
                    response.message || "Failed to fetch user info",
                );
            }

            return response.data;
        } catch (error) {
            throw this.normalizeError(error, "Failed to fetch user info");
        }
    }

    /**
     * Refresh access and refresh tokens
     */
    async refreshToken(): Promise<IRefreshTokenResponse> {
        try {
            const response = await httpClient.post<IRefreshTokenResponse>(
                `${AUTH_ENDPOINT}/refresh-token`,
                {},
            );

            if (!response.success || !response.data) {
                throw new Error(response.message || "Token refresh failed");
            }

            return response.data;
        } catch (error) {
            throw this.normalizeError(error, "Token refresh failed");
        }
    }

    /**
     * Change current user password
     */
    async changePassword(
        payload: IChangePasswordPayload,
    ): Promise<ILoginResponse> {
        try {
            const response = await httpClient.post<ILoginResponse>(
                `${AUTH_ENDPOINT}/change-password`,
                payload,
            );

            if (!response.success || !response.data) {
                throw new Error(response.message || "Password change failed");
            }

            return response.data;
        } catch (error) {
            throw this.normalizeError(error, "Password change failed");
        }
    }

    /**
     * Logout current user
     */
    async logout(): Promise<ILogoutResponse> {
        try {
            const response = await httpClient.post<ILogoutResponse>(
                `${AUTH_ENDPOINT}/logout`,
                {},
            );

            if (!response.success || !response.data) {
                throw new Error(response.message || "Logout failed");
            }

            return response.data;
        } catch (error) {
            throw this.normalizeError(error, "Logout failed");
        }
    }

    /**
     * Verify email with OTP
     */
    async verifyEmail(payload: IVerifyEmailPayload): Promise<void> {
        try {
            const response = await httpClient.post<void>(
                `${AUTH_ENDPOINT}/verify-email`,
                payload,
            );

            if (!response.success) {
                throw new Error(
                    response.message || "Email verification failed",
                );
            }
        } catch (error) {
            throw this.normalizeError(error, "Email verification failed");
        }
    }

    /**
     * Request password reset OTP
     */
    async forgetPassword(payload: IForgetPasswordPayload): Promise<void> {
        try {
            const response = await httpClient.post<void>(
                `${AUTH_ENDPOINT}/forget-password`,
                payload,
            );

            if (!response.success) {
                throw new Error(
                    response.message || "Password reset request failed",
                );
            }
        } catch (error) {
            throw this.normalizeError(error, "Password reset request failed");
        }
    }

    /**
     * Reset password with OTP
     */
    async resetPassword(payload: IResetPasswordPayload): Promise<void> {
        try {
            const response = await httpClient.post<void>(
                `${AUTH_ENDPOINT}/reset-password`,
                payload,
            );

            if (!response.success) {
                throw new Error(response.message || "Password reset failed");
            }
        } catch (error) {
            throw this.normalizeError(error, "Password reset failed");
        }
    }

    /**
     * Normalize errors to consistent format
     */
    private normalizeError(error: unknown, defaultMessage: string): Error {
        if (error instanceof Error) {
            return new Error(error.message || defaultMessage);
        }

        if (typeof error === "object" && error !== null && "message" in error) {
            return new Error((error as any).message || defaultMessage);
        }

        return new Error(defaultMessage);
    }
}

export const authApiClient = new AuthApiClient();
