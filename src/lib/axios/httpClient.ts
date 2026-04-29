
/**
 * Centralized HTTP client for all API requests
 * Handles:
 * - Automatic cookie inclusion
 * - Proactive token refresh before expiry
 * - Consistent error handling and response parsing
 * - Session-refresh header monitoring
 */

import { ApiResponse } from "@/types/api.types";
import axios from "axios";
import { parseAxiosError } from "./parseAxiosError";
import { isTokenExpiringSoon } from "../tokenUtils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const IS_SERVER = typeof window === "undefined";
const BROWSER_PROXY_BASE_URL = "/api/proxy";

if (!API_BASE_URL) {
    throw new Error(
        "NEXT_PUBLIC_API_BASE_URL is not defined in environment variables",
    );
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

    if (typeof window !== "undefined") {
        return;
    }

    const { headers } = await import("next/headers");
    const requestHeader = await headers();

    if (requestHeader.get("x-token-refreshed") === "1") {
        return; // avoid multiple refresh attempts in the same request lifecycle
    }

    try {
        const { getNewTokensWithRefreshToken } = await import(
            "@/services/auth.services"
        );
        await getNewTokensWithRefreshToken(refreshToken);
    } catch (error) {
        console.error("Error refreshing token in http client:", error);
    }
}

/**
 * Create axios instance with cookies and authorization headers
 */
const axiosInstance = async () => {
    let cookieHeader = "";

    if (IS_SERVER) {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("accessToken")?.value;
        const refreshToken = cookieStore.get("refreshToken")?.value;

        if (accessToken && refreshToken) {
            await tryRefreshToken(accessToken, refreshToken);
        }

        cookieHeader = cookieStore
            .getAll()
            .map((cookie) => `${cookie.name}=${cookie.value}`)
            .join("; ");
    }

    const instance = axios.create({
        baseURL: IS_SERVER ? API_BASE_URL : BROWSER_PROXY_BASE_URL,
        timeout: 30000,
        withCredentials: true,
        headers: {
            "Content-Type": "application/json",
            ...(cookieHeader ? { Cookie: cookieHeader } : {}),
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
