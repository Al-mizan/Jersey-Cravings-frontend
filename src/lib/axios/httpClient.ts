/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiResponse } from '@/types/api.types';
import axios from 'axios';
import { getNewTokensWithRefreshToken } from '@/services/auth.service';
import { cookies, headers } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const CLIENT_PROXY_BASE_URL = "/api/proxy";

if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined in environment variables');
}

const getTokenSecondsRemaining = (token: string): number => {
    if (!token) return 0;
    try {
        const [, payloadBase64] = token.split(".");
        if (!payloadBase64) return 0;
        const payload = JSON.parse(
            typeof window === "undefined"
                ? Buffer.from(payloadBase64, "base64").toString("utf-8")
                : atob(payloadBase64),
        ) as { exp?: number };
        if (!payload.exp) return 0;
        const remaining = payload.exp - Math.floor(Date.now() / 1000);
        return remaining > 0 ? remaining : 0;
    } catch {
        return 0;
    }
};

const isTokenExpiringSoon = (token: string, thresholdInSeconds = 300) => {
    const remaining = getTokenSecondsRemaining(token);
    return remaining > 0 && remaining <= thresholdInSeconds;
};

async function tryRefreshToken(accessToken: string, refreshToken: string): Promise<void> {
    if (!isTokenExpiringSoon(accessToken)) {
        return;
    }
    if (typeof window !== "undefined") {
        return; // Client-side should not attempt server-only refresh
    }
    const reqHeaders = await headers();
    if (reqHeaders.get("x-token-refreshed") === "1") {
        return; // avoid multiple refresh attempts in the same request lifecycle
    }
    try {
        await getNewTokensWithRefreshToken(refreshToken);
    } catch (error: any) {
        console.error("Error refreshing token in http client:", error);
    }
}

const axiosInstance = async () => {
    let cookieHeader = "";

    if (typeof window === "undefined") {
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
        baseURL:
            typeof window === "undefined" ? API_BASE_URL : CLIENT_PROXY_BASE_URL,
        timeout: 30000,
        headers: {
            'Content-Type': 'application/json',
            ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
        withCredentials: true,
    })

    return instance;
}

export interface ApiRequestOptions {
    params?: Record<string, unknown>;
    headers?: Record<string, string>;
}

const httpGet = async <TData>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {
        const instance = await axiosInstance();
        const response = await instance.get<ApiResponse<TData>>(endpoint, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        console.error(`GET request to ${endpoint} failed:`, error);
        throw error;
    }
}

const httpPost = async <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {
        const instance = await axiosInstance();
        const response = await instance.post<ApiResponse<TData>>(endpoint, data, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        console.error(`POST request to ${endpoint} failed:`, error);
        throw error;
    }
}

const httpPut = async <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {
        const instance = await axiosInstance();
        const response = await instance.put<ApiResponse<TData>>(endpoint, data, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        console.error(`PUT request to ${endpoint} failed:`, error);
        throw error;
    }
}

const httpPatch = async <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {
        const instance = await axiosInstance();
        const response = await instance.patch<ApiResponse<TData>>(endpoint, data, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    }
    catch (error) {
        console.error(`PATCH request to ${endpoint} failed:`, error);
        throw error;
    }
}

const httpDelete = async <TData>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {
        const instance = await axiosInstance();
        const response = await instance.delete<ApiResponse<TData>>(endpoint, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        console.error(`DELETE request to ${endpoint} failed:`, error);
        throw error;
    }
}

export const httpClient = {
    get: httpGet,
    post: httpPost,
    put: httpPut,
    patch: httpPatch,
    delete: httpDelete,
}