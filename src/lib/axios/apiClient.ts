import { ApiResponse } from "@/types/api.types";
import axios, { AxiosRequestConfig, Method } from "axios";
import { parseAxiosError } from "./parseAxiosError";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);
const MAX_RETRY_ATTEMPTS = 1;
const BASE_RETRY_DELAY_MS = 400;

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

export interface ApiRequestOptions {
    params?: Record<string, unknown>;
    headers?: Record<string, string>;
}

interface RetryableRequestConfig extends AxiosRequestConfig {
    retryAttempt?: number;
}

const sleep = async (delayMs: number) => {
    await new Promise((resolve) => {
        setTimeout(resolve, delayMs);
    });
};

const shouldRetry = (error: unknown, attempt: number): boolean => {
    if (!axios.isAxiosError(error)) {
        return false;
    }

    if (attempt >= MAX_RETRY_ATTEMPTS) {
        return false;
    }

    if (!error.response) {
        return true;
    }

    return RETRYABLE_STATUS.has(error.response.status);
};

const request = async <TData>(
    method: Method,
    endpoint: string,
    data?: unknown,
    options?: ApiRequestOptions,
    attempt = 0,
): Promise<ApiResponse<TData>> => {
    const config: RetryableRequestConfig = {
        method,
        url: endpoint,
        data,
        params: options?.params,
        headers: options?.headers,
        retryAttempt: attempt,
    };

    if (typeof FormData !== "undefined" && data instanceof FormData) {
        const normalizedHeaders = { ...(config.headers ?? {}) };
        delete normalizedHeaders["Content-Type"];
        config.headers = normalizedHeaders;
    }

    try {
        const response = await axiosInstance.request<ApiResponse<TData>>(config);
        return response.data;
    } catch (error) {
        if (shouldRetry(error, attempt)) {
            const nextAttempt = attempt + 1;
            await sleep(BASE_RETRY_DELAY_MS * nextAttempt);
            return request(method, endpoint, data, options, nextAttempt);
        }

        throw new Error(parseAxiosError(error));
    }
};

export const apiClient = {
    get: <TData>(endpoint: string, options?: ApiRequestOptions) =>
        request<TData>("GET", endpoint, undefined, options),

    post: <TData>(
        endpoint: string,
        data?: unknown,
        options?: ApiRequestOptions,
    ) => request<TData>("POST", endpoint, data, options),

    put: <TData>(
        endpoint: string,
        data?: unknown,
        options?: ApiRequestOptions,
    ) => request<TData>("PUT", endpoint, data, options),

    patch: <TData>(
        endpoint: string,
        data?: unknown,
        options?: ApiRequestOptions,
    ) => request<TData>("PATCH", endpoint, data, options),

    delete: <TData>(endpoint: string, options?: ApiRequestOptions) =>
        request<TData>("DELETE", endpoint, undefined, options),
};
