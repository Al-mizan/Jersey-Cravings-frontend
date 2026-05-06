"use client";

import { logoutAction } from "@/app/(dashboardLayout)/_actions/logout/_action";
import { authApiClient } from "@/lib/axios/authApiClient";
import { IUserInfo } from "@/types/auth.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const authQueryKey = ["auth", "me"] as const;

interface UseAuthOptions {
    includeUser?: boolean;
}

const getCurrentUser = async (): Promise<IUserInfo | null> => {
    try {
        return await authApiClient.getMe();
    } catch {
        return null;
    }
};

export function useAuth(options?: UseAuthOptions) {
    const includeUser = options?.includeUser ?? true;
    const router = useRouter();
    const queryClient = useQueryClient();

    const resetAuthSession = async () => {
        await queryClient.cancelQueries();
        queryClient.clear();
    };

    const { data: user = null, isLoading } = useQuery({
        queryKey: authQueryKey,
        queryFn: getCurrentUser,
        enabled: includeUser,
        staleTime: 60_000,
    });

    const logoutMutation = useMutation({
        mutationFn: logoutAction,
        onSettled: async () => {
            await resetAuthSession();
            router.replace("/login");
            router.refresh();
        },
    });

    return {
        user,
        isLoading: includeUser ? isLoading : false,
        isAuthenticated: includeUser ? Boolean(user) : false,
        logout: logoutMutation.mutateAsync,
        isLoggingOut: logoutMutation.isPending,
    };
}
