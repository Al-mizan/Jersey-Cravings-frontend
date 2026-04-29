import { httpClient } from "./httpClient";
import type {
    IAddToCartPayload,
    ICart,
    IUpdateCartItemPayload,
    ICoupon,
    ICouponListResponse,
    ICreateCouponPayload,
    IUpdateCouponPayload,
    IValidateCouponPayload,
    IPickupLocation,
    IPickupLocationListResponse,
    ICreatePickupLocationPayload,
    IUpdatePickupLocationPayload,
    IOrderGiftAddon,
    IUpsertGiftAddonPayload,
} from "@/types/commerce.types";
import type { IApiResponse } from "@/types/auth.types";

class CommerceApiClient {
    // Cart
    async getMyCart(): Promise<ICart> {
        const { data } = await httpClient.get<IApiResponse<ICart>>("/carts/my");
        return data.data as ICart;
    }

    async addToCart(payload: IAddToCartPayload): Promise<ICart> {
        const { data } = await httpClient.post<IApiResponse<ICart>>(
            "/carts/my/items",
            payload,
        );
        return data.data as ICart;
    }

    async updateCartItem(
        cartItemId: string,
        payload: IUpdateCartItemPayload,
    ): Promise<ICart> {
        const { data } = await httpClient.patch<IApiResponse<ICart>>(
            `/carts/my/items/${cartItemId}`,
            payload,
        );
        return data.data as ICart;
    }

    async removeCartItem(cartItemId: string): Promise<ICart> {
        const { data } = await httpClient.delete<IApiResponse<ICart>>(
            `/carts/my/items/${cartItemId}`,
        );
        return data.data as ICart;
    }

    async clearMyCart(): Promise<ICart> {
        const { data } =
            await httpClient.delete<IApiResponse<ICart>>("/carts/my/clear");
        return data.data as ICart;
    }

    async getCustomerCart(userId: string): Promise<ICart> {
        const { data } = await httpClient.get<IApiResponse<ICart>>(
            `/carts/customer/${userId}`,
        );
        return data.data as ICart;
    }

    // Coupons
    async getPublicCoupons(): Promise<ICoupon[]> {
        const { data } =
            await httpClient.get<IApiResponse<ICoupon[]>>("/coupons/public");
        return (data.data as ICoupon[]) || [];
    }

    async validateCoupon(
        payload: IValidateCouponPayload,
    ): Promise<{ isValid: boolean; message: string }> {
        const { data } = await httpClient.post<
            IApiResponse<{ isValid: boolean; message: string }>
        >("/coupons/validate", payload);
        return data.data as { isValid: boolean; message: string };
    }

    async getAllCoupons(
        searchTerm?: string,
        isActive?: boolean,
        isDeleted?: boolean,
        page: number = 1,
        limit: number = 10,
    ): Promise<ICouponListResponse> {
        const params = new URLSearchParams();
        if (searchTerm) params.append("searchTerm", searchTerm);
        if (isActive !== undefined) params.append("isActive", String(isActive));
        if (isDeleted !== undefined)
            params.append("isDeleted", String(isDeleted));
        if (page) params.append("page", page.toString());
        if (limit) params.append("limit", limit.toString());

        const { data } = await httpClient.get<
            IApiResponse<ICouponListResponse>
        >(`/coupons?${params.toString()}`);
        return data.data as ICouponListResponse;
    }

    async getCouponById(couponId: string): Promise<ICoupon> {
        const { data } = await httpClient.get<IApiResponse<ICoupon>>(
            `/coupons/${couponId}`,
        );
        return data.data as ICoupon;
    }

    async createCoupon(payload: ICreateCouponPayload): Promise<ICoupon> {
        const { data } = await httpClient.post<IApiResponse<ICoupon>>(
            "/coupons",
            payload,
        );
        return data.data as ICoupon;
    }

    async updateCoupon(
        couponId: string,
        payload: IUpdateCouponPayload,
    ): Promise<ICoupon> {
        const { data } = await httpClient.patch<IApiResponse<ICoupon>>(
            `/coupons/${couponId}`,
            payload,
        );
        return data.data as ICoupon;
    }

    async deleteCoupon(couponId: string): Promise<ICoupon> {
        const { data } = await httpClient.delete<IApiResponse<ICoupon>>(
            `/coupons/${couponId}`,
        );
        return data.data as ICoupon;
    }

    async restoreCoupon(couponId: string): Promise<ICoupon> {
        const { data } = await httpClient.patch<IApiResponse<ICoupon>>(
            `/coupons/${couponId}/restore`,
            {},
        );
        return data.data as ICoupon;
    }

    // Fulfillment (Pickup Locations)
    async getActivePickupLocations(): Promise<IPickupLocation[]> {
        const { data } = await httpClient.get<IApiResponse<IPickupLocation[]>>(
            "/fulfillment/active",
        );
        return (data.data as IPickupLocation[]) || [];
    }

    async getPickupLocations(
        page: number = 1,
        limit: number = 10,
    ): Promise<IPickupLocationListResponse> {
        const params = new URLSearchParams();
        if (page) params.append("page", page.toString());
        if (limit) params.append("limit", limit.toString());

        const { data } = await httpClient.get<
            IApiResponse<IPickupLocationListResponse>
        >(`/fulfillment?${params.toString()}`);
        return data.data as IPickupLocationListResponse;
    }

    async createPickupLocation(
        payload: ICreatePickupLocationPayload,
    ): Promise<IPickupLocation> {
        const { data } = await httpClient.post<IApiResponse<IPickupLocation>>(
            "/fulfillment",
            payload,
        );
        return data.data as IPickupLocation;
    }

    async updatePickupLocation(
        locationId: string,
        payload: IUpdatePickupLocationPayload,
    ): Promise<IPickupLocation> {
        const { data } = await httpClient.patch<IApiResponse<IPickupLocation>>(
            `/fulfillment/${locationId}`,
            payload,
        );
        return data.data as IPickupLocation;
    }

    async deletePickupLocation(locationId: string): Promise<IPickupLocation> {
        const { data } = await httpClient.delete<IApiResponse<IPickupLocation>>(
            `/fulfillment/${locationId}`,
        );
        return data.data as IPickupLocation;
    }

    // Gift Add-on
    async getMyGiftAddon(orderId: string): Promise<IOrderGiftAddon> {
        const { data } = await httpClient.get<IApiResponse<IOrderGiftAddon>>(
            `/gift-addons/my/${orderId}`,
        );
        return data.data as IOrderGiftAddon;
    }

    async upsertMyGiftAddon(
        orderId: string,
        payload: IUpsertGiftAddonPayload,
    ): Promise<IOrderGiftAddon> {
        const { data } = await httpClient.put<IApiResponse<IOrderGiftAddon>>(
            `/gift-addons/my/${orderId}`,
            payload,
        );
        return data.data as IOrderGiftAddon;
    }

    async removeMyGiftAddon(orderId: string): Promise<IOrderGiftAddon> {
        const { data } = await httpClient.delete<IApiResponse<IOrderGiftAddon>>(
            `/gift-addons/my/${orderId}`,
        );
        return data.data as IOrderGiftAddon;
    }

    async getOrderGiftAddon(orderId: string): Promise<IOrderGiftAddon> {
        const { data } = await httpClient.get<IApiResponse<IOrderGiftAddon>>(
            `/gift-addons/order/${orderId}`,
        );
        return data.data as IOrderGiftAddon;
    }
}

export const commerceApiClient = new CommerceApiClient();
