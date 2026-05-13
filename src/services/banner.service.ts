"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { safeServiceCall, unwrapData } from "@/services/service-utils";
import { IBanner } from "@/types/banner.types";


export async function getActiveBanners(): Promise<IBanner[]> {
    return safeServiceCall(
        () => unwrapData<IBanner[]>(httpClient.get("/banners")),
        [],
        "Failed to fetch active banners:",
    );
}

export async function getAllBanners(): Promise<IBanner[]> {
    return safeServiceCall(
        () => unwrapData<IBanner[]>(httpClient.get("/banners/all")),
        [],
        "Failed to fetch all banners:",
    );
}

export async function createBanner(formData: FormData): Promise<IBanner | null> {
    return safeServiceCall(
        () => unwrapData<IBanner>(httpClient.post("/banners", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })),
        null,
        "Failed to upload banner:",
    );
}

export async function updateBannerOrder(id: string, displayOrder: number): Promise<IBanner | null> {
    return safeServiceCall(
        () => unwrapData<IBanner>(httpClient.patch(`/banners/${id}/order`, { displayOrder })),
        null,
        "Failed to update banner order:",
    );
}

export async function deleteBanner(id: string): Promise<IBanner | null> {
    return safeServiceCall(
        () => unwrapData<IBanner>(httpClient.delete(`/banners/${id}`)),
        null,
        "Failed to delete banner:",
    );
}

export async function restoreBanner(id: string): Promise<IBanner | null> {
    return safeServiceCall(
        () => unwrapData<IBanner>(httpClient.patch(`/banners/${id}/restore`, {})),
        null,
        "Failed to restore banner:",
    );
}
