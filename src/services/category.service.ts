"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { safeServiceCall } from "@/services/service-utils";
import { ApiResponse } from "@/types/api.types";

export interface ICategory {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

const unwrapData = async <TData>(
    request: Promise<ApiResponse<TData>>,
): Promise<TData> => {
    const response = await request;
    return response.data;
};

export async function getCategories(): Promise<ICategory[]> {
    return safeServiceCall(
        () => unwrapData<ICategory[]>(httpClient.get("/categories")),
        [],
        "Failed to fetch categories:",
    );
}

export async function getCategoryBySlug(
    slug: string,
): Promise<ICategory | null> {
    return safeServiceCall(
        async () => {
            const categories = await unwrapData<ICategory[]>(
                httpClient.get("/categories", {
                    params: { slug, limit: 1 },
                }),
            );
            return categories.length > 0 ? categories[0] : null;
        },
        null,
        "Failed to fetch category by slug:",
    );
}
