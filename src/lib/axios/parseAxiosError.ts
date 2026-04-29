import { AxiosError } from "axios";

interface BackendErrorSource {
    path: string;
    message: string;
}

interface BackendErrorResponse {
    success?: boolean;
    message?: string;
    errorSources?: BackendErrorSource[];
}

const DEFAULT_ERROR_MESSAGE = "An unexpected error occurred";

export const parseAxiosError = (error: unknown): string => {
    if (error instanceof AxiosError) {
        const normalizedMessage = (error.message || "").toLowerCase();
        const responseData = error.response?.data as
            | BackendErrorResponse
            | undefined;

        if (
            normalizedMessage.includes("connection closed by upstream database") ||
            normalizedMessage.includes("connection reset by peer") ||
            normalizedMessage.includes("socket hang up") ||
            normalizedMessage.includes("network error") ||
            error.code === "ECONNRESET" ||
            error.code === "ECONNABORTED"
        ) {
            return "Authentication service is temporarily unavailable. Please try again in a moment.";
        }

        if (responseData?.message) {
            return responseData.message;
        }

        if (responseData?.errorSources && responseData.errorSources.length > 0) {
            return responseData.errorSources
                .map((source) => source.message)
                .join(", ");
        }

        if (error.response?.status === 401) {
            return "Unauthorized. Please login again.";
        }

        if (error.response?.status === 403) {
            return "Access denied.";
        }

        if (error.response?.status === 404) {
            return "Resource not found.";
        }

        if (error.response?.status === 500) {
            return "Server error. Please try again later.";
        }

        return error.message || DEFAULT_ERROR_MESSAGE;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return DEFAULT_ERROR_MESSAGE;
};
