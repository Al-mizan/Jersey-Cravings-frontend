"use client";

import { logout as logoutAction, getUserInfo } from "@/services/auth.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const authQueryKey = ["auth", "me"] as const;

const isNetworkError = (error: unknown): boolean => {
    if (!(error instanceof Error)) return false;
    const message = error.message.toLowerCase();
    return (
        message.includes("network") ||
        message.includes("temporarily unavailable") ||
        message.includes("timeout") ||
        message.includes("connection")
    );
};

interface UseAuthOptions {
    includeUser?: boolean;
}

export function useAuth({ includeUser = true }: UseAuthOptions = {}) {
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data, isLoading, error } = useQuery({
        queryKey: authQueryKey,
        queryFn: getUserInfo,
        staleTime: 60_000,
        enabled: includeUser, // skip the /me fetch when not needed
        retry: (failureCount, queryError) => {
            if (!isNetworkError(queryError)) return false;
            return failureCount < 2;
        },
    });

    const { mutateAsync: logout, isPending: isLoggingOut } = useMutation({
        mutationFn: logoutAction,
        onSuccess: () => {
            toast.success("Logged out successfully");
            queryClient.clear();
            router.push("/login");
        },
        onError: () => {
            toast.error("Failed to log out. Please try again.");
        },
    });

    return {
        user: includeUser ? (data ?? null) : null,
        isLoading: includeUser ? isLoading : false,
        isAuthenticated: Boolean(data),
        error: error instanceof Error ? error.message : null,
        logout,
        isLoggingOut,
    };
}
