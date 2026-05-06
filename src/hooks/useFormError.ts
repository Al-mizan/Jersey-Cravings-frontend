import { useState } from "react";

/**
 * Custom hook for managing form-level server errors
 * @returns Object with serverError state and helper methods
 */
export function useFormError() {
    const [serverError, setServerError] = useState<string | null>(null);

    const clearError = () => setServerError(null);

    const setError = (message: string) => {
        setServerError(message);
    };

    const handleError = (error: unknown) => {
        const message =
            error instanceof Error ? error.message : "An error occurred";
        setError(message);
    };

    return {
        serverError,
        clearError,
        setError,
        handleError,
    };
}
