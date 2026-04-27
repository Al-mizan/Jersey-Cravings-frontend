/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Centralized HTTP client for all API requests
 * Handles:
 * - Automatic cookie inclusion
 * - Proactive token refresh before expiry
 * - Consistent error handling and response parsing
 * - Session-refresh header monitoring
 */

import { getNewTokensWithRefreshToken } from "@/services/auth.services";
import { ApiResponse } from "@/types/api.types";
import axios, { AxiosError } from "axios";
import { cookies, headers } from "next/headers";
import { isTokenExpiringSoon } from "../tokenUtils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error(
        "NEXT_PUBLIC_API_BASE_URL is not defined in environment variables",
    );
}

/**
 * Error handler that normalizes axios errors to readable messages
 */
function parseAxiosError(error: any): string {
    if (error instanceof AxiosError) {
        const status = error.response?.status;
        const data = error.response?.data;

        if (data && typeof data === "object" && "message" in data) {
            return (data as any).message;
        }

        if (status === 401) {
            return "Unauthorized. Please login again.";
        }
        if (status === 403) {
            return "Access denied.";
        }
        if (status === 404) {
            return "Resource not found.";
        }
        if (status === 500) {
            return "Server error. Please try again later.";
        }

        return error.message || "An error occurred";
    }

    return error instanceof Error
        ? error.message
        : "An unexpected error occurred";
}

/**
 * Proactive token refresh if expiring soon
 */
async function tryRefreshToken(
    accessToken: string,
    refreshToken: string,
): Promise<void> {
    if (!(await isTokenExpiringSoon(accessToken))) {
        return;
    }

    const requestHeader = await headers();

    if (requestHeader.get("x-token-refreshed") === "1") {
        return; // avoid multiple refresh attempts in the same request lifecycle
    }

    try {
        await getNewTokensWithRefreshToken(refreshToken);
    } catch (error: any) {
        console.error("Error refreshing token in http client:", error);
    }
}

/**
 * Create axios instance with cookies and authorization headers
 */
const axiosInstance = async () => {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (accessToken && refreshToken) {
        await tryRefreshToken(accessToken, refreshToken);
    }

    const cookieHeader = cookieStore
        .getAll()
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ");

    const instance = axios.create({
        baseURL: API_BASE_URL,
        timeout: 30000,
        headers: {
            "Content-Type": "application/json",
            Cookie: cookieHeader,
        },
    });

    return instance;
};

export interface ApiRequestOptions {
    params?: Record<string, unknown>;
    headers?: Record<string, string>;
}

/**
 * GET request with response parsing
 */
const httpGet = async <TData>(
    endpoint: string,
    options?: ApiRequestOptions,
): Promise<ApiResponse<TData>> => {
    try {
        const instance = await axiosInstance();
        const response = await instance.get<ApiResponse<TData>>(endpoint, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        const message = parseAxiosError(error);
        console.error(`GET request to ${endpoint} failed:`, message);
        throw new Error(message);
    }
};

/**
 * POST request with response parsing
 */
const httpPost = async <TData>(
    endpoint: string,
    data: unknown,
    options?: ApiRequestOptions,
): Promise<ApiResponse<TData>> => {
    try {
        const instance = await axiosInstance();
        const response = await instance.post<ApiResponse<TData>>(
            endpoint,
            data,
            {
                params: options?.params,
                headers: options?.headers,
            },
        );
        return response.data;
    } catch (error) {
        const message = parseAxiosError(error);
        console.error(`POST request to ${endpoint} failed:`, message);
        throw new Error(message);
    }
};

/**
 * PUT request with response parsing
 */
const httpPut = async <TData>(
    endpoint: string,
    data: unknown,
    options?: ApiRequestOptions,
): Promise<ApiResponse<TData>> => {
    try {
        const instance = await axiosInstance();
        const response = await instance.put<ApiResponse<TData>>(
            endpoint,
            data,
            {
                params: options?.params,
                headers: options?.headers,
            },
        );
        return response.data;
    } catch (error) {
        const message = parseAxiosError(error);
        console.error(`PUT request to ${endpoint} failed:`, message);
        throw new Error(message);
    }
};

/**
 * PATCH request with response parsing
 */
const httpPatch = async <TData>(
    endpoint: string,
    data: unknown,
    options?: ApiRequestOptions,
): Promise<ApiResponse<TData>> => {
    try {
        const instance = await axiosInstance();
        const response = await instance.patch<ApiResponse<TData>>(
            endpoint,
            data,
            {
                params: options?.params,
                headers: options?.headers,
            },
        );
        return response.data;
    } catch (error) {
        const message = parseAxiosError(error);
        console.error(`PATCH request to ${endpoint} failed:`, message);
        throw new Error(message);
    }
};

/**
 * DELETE request with response parsing
 */
const httpDelete = async <TData>(
    endpoint: string,
    options?: ApiRequestOptions,
): Promise<ApiResponse<TData>> => {
    try {
        const instance = await axiosInstance();
        const response = await instance.delete<ApiResponse<TData>>(endpoint, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        const message = parseAxiosError(error);
        console.error(`DELETE request to ${endpoint} failed:`, message);
        throw new Error(message);
    }
};

export const httpClient = {
    get: httpGet,
    post: httpPost,
    put: httpPut,
    patch: httpPatch,
    delete: httpDelete,
};
