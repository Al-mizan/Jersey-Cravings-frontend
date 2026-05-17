"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { safeServiceCall, safeServiceMutation, unwrapData } from "@/services/service-utils";

const UTILITY_COST_ENDPOINTS = {
    utilityCosts: "/utility-costs",
};

export interface IUtilityCost {
    id: string;
    type: string;
    amount: number;
    details: string;
    createdAt: string;
    updatedAt: string;
}

export interface IUtilityCostListResponse {
    data: IUtilityCost[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export async function getAllUtilityCosts(
    searchTerm?: string,
    page: number = 1,
    limit: number = 10,
): Promise<IUtilityCostListResponse | null | undefined> {
    return safeServiceCall(
        () =>
            unwrapData<IUtilityCostListResponse>(
                httpClient.get(UTILITY_COST_ENDPOINTS.utilityCosts, {
                    params: {
                        searchTerm,
                        page,
                        limit,
                    },
                }),
            ),
        null,
        "Failed to fetch utility costs:",
    );
}

export async function createUtilityCost(payload: {
    type: string;
    amount: number;
    details: string;
}): Promise<IUtilityCost> {
    return safeServiceMutation(
        () =>
            unwrapData<IUtilityCost>(
                httpClient.post(UTILITY_COST_ENDPOINTS.utilityCosts, payload),
            ),
        "Failed to create utility cost:",
    );
}

export async function deleteUtilityCost(id: string): Promise<void> {
    return safeServiceMutation(
        () =>
            unwrapData<void>(
                httpClient.delete(`${UTILITY_COST_ENDPOINTS.utilityCosts}/${id}`),
            ),
        "Failed to delete utility cost:",
    );
}
