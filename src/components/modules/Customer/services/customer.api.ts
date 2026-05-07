import { ApiResponse, PaginationMeta } from "@/types/api.types";
import {
    IAddress,
    IAddressQueryParams,
    IChangeCustomerStatusPayload,
    ICustomer,
    ICreateAddressPayload,
    ICreateReviewPayload,
    ICustomerLoyaltyDetails,
    ICustomerProfile,
    ICustomerQueryParams,
    ICustomerStatusChangeResult,
    IDeleteSuccessResponse,
    IModerateReviewPayload,
    IMyLoyaltySummary,
    IPaginatedData,
    IPointTransaction,
    IPointTransactionQueryParams,
    IReferralCode,
    IReferralEvent,
    IReferralEventQueryParams,
    IReview,
    IReviewQueryParams,
    IUpdateAddressPayload,
    IUpdateLoyaltySettingPayload,
    IUpdateMyProfilePayload,
    IUpdateReviewPayload,
    ILoyaltySetting,
    IOverrideReferralStatusPayload,
} from "@/types/customer.types";
import { apiClient } from "@/lib/axios/apiClient";

const CUSTOMER_BASE = "/customers";

const DEFAULT_PAGINATION_META: PaginationMeta = {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
};

const toPaginatedData = <T>(response: ApiResponse<T[]>): IPaginatedData<T> => {
    return {
        data: response.data,
        meta: response.meta ?? DEFAULT_PAGINATION_META,
    };
};

const serializeQueryParams = (
    params:
        | ICustomerQueryParams
        | IAddressQueryParams
        | IPointTransactionQueryParams
        | IReferralEventQueryParams
        | IReviewQueryParams
        | undefined,
): Record<string, unknown> | undefined => {
    if (!params) {
        return undefined;
    }

    const query: Record<string, unknown> = {};

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
            return;
        }

        query[key] = value;
    });

    return query;
};

const toFormData = (payload: Record<string, unknown>): FormData => {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) {
            return;
        }

        if (typeof value === "string" || typeof value === "boolean") {
            formData.append(key, String(value));
        }
    });

    return formData;
};

const toMultipartDataField = (payload: unknown): FormData => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));
    return formData;
};

class CustomerApiClient {
    // Profile
    async getMyProfile(): Promise<ICustomerProfile> {
        const response = await apiClient.get<ICustomerProfile>(
            `${CUSTOMER_BASE}/profile/me`,
        );
        console.log(response.data, "response from get my profile");
        return response.data;
    }

    async updateMyProfile(
        payload: IUpdateMyProfilePayload,
    ): Promise<ICustomer> {
        const formData = toFormData(payload as Record<string, unknown>);

        const response = await apiClient.patch<ICustomer>(
            `${CUSTOMER_BASE}/profile/me`,
            formData,
            undefined,
        );

        return response.data;
    }

    async getAllCustomers(
        params?: ICustomerQueryParams,
    ): Promise<IPaginatedData<ICustomerProfile>> {
        const response = await apiClient.get<ICustomerProfile[]>(
            `${CUSTOMER_BASE}/profile`,
            {
                params: serializeQueryParams(params),
            },
        );

        return toPaginatedData(response);
    }

    async getCustomerById(customerId: string): Promise<ICustomerProfile> {
        const response = await apiClient.get<ICustomerProfile>(
            `${CUSTOMER_BASE}/profile/${customerId}`,
        );
        return response.data;
    }

    async changeCustomerStatus(
        payload: IChangeCustomerStatusPayload,
    ): Promise<ICustomerStatusChangeResult> {
        const response = await apiClient.patch<ICustomerStatusChangeResult>(
            `${CUSTOMER_BASE}/profile/status`,
            payload,
        );

        return response.data;
    }

    async restoreCustomer(customerId: string): Promise<ICustomerStatusChangeResult> {
        const response = await apiClient.patch<ICustomerStatusChangeResult>(
            `${CUSTOMER_BASE}/profile/${customerId}/restore`,
            {},
        );

        return response.data;
    }

    // Address
    async getMyAddresses(
        params?: IAddressQueryParams,
    ): Promise<IPaginatedData<IAddress>> {
        const response = await apiClient.get<IAddress[]>(
            `${CUSTOMER_BASE}/addresses/my`,
            {
                params: serializeQueryParams(params),
            },
        );

        return toPaginatedData(response);
    }

    async createAddress(payload: ICreateAddressPayload): Promise<IAddress> {
        const response = await apiClient.post<IAddress>(
            `${CUSTOMER_BASE}/addresses/my`,
            payload,
        );

        return response.data;
    }

    async updateAddress(
        addressId: string,
        payload: IUpdateAddressPayload,
    ): Promise<IAddress> {
        const response = await apiClient.patch<IAddress>(
            `${CUSTOMER_BASE}/addresses/my/${addressId}`,
            payload,
        );

        return response.data;
    }

    async deleteAddress(addressId: string): Promise<IDeleteSuccessResponse> {
        const response = await apiClient.delete<IDeleteSuccessResponse>(
            `${CUSTOMER_BASE}/addresses/my/${addressId}`,
        );

        return response.data;
    }

    async getCustomerAddressesForAdmin(customerId: string): Promise<IAddress[]> {
        const response = await apiClient.get<IAddress[]>(
            `${CUSTOMER_BASE}/addresses/customer/${customerId}`,
        );

        return response.data;
    }

    // Loyalty
    async getMyLoyaltySummary(): Promise<IMyLoyaltySummary> {
        const response = await apiClient.get<IMyLoyaltySummary>(
            `${CUSTOMER_BASE}/loyalty/me`,
        );

        return response.data;
    }

    async getMyPointTransactions(
        params?: IPointTransactionQueryParams,
    ): Promise<IPaginatedData<IPointTransaction>> {
        const response = await apiClient.get<IPointTransaction[]>(
            `${CUSTOMER_BASE}/loyalty/me/transactions`,
            {
                params: serializeQueryParams(params),
            },
        );

        return toPaginatedData(response);
    }

    async getActiveLoyaltySetting(): Promise<ILoyaltySetting | null> {
        const response = await apiClient.get<ILoyaltySetting | null>(
            `${CUSTOMER_BASE}/loyalty/settings`,
        );

        return response.data;
    }

    async updateLoyaltySetting(
        payload: IUpdateLoyaltySettingPayload,
    ): Promise<ILoyaltySetting> {
        const response = await apiClient.patch<ILoyaltySetting>(
            `${CUSTOMER_BASE}/loyalty/settings`,
            payload,
        );

        return response.data;
    }

    async getCustomerLoyaltyByAdmin(
        customerId: string,
    ): Promise<ICustomerLoyaltyDetails> {
        const response = await apiClient.get<ICustomerLoyaltyDetails>(
            `${CUSTOMER_BASE}/loyalty/customer/${customerId}`,
        );

        return response.data;
    }

    // Referrals
    async getOrCreateMyReferralCode(): Promise<IReferralCode> {
        const response = await apiClient.get<IReferralCode>(
            `${CUSTOMER_BASE}/referrals/my-code`,
        );

        return response.data;
    }

    async getMyReferralEvents(
        params?: IReferralEventQueryParams,
    ): Promise<IPaginatedData<IReferralEvent>> {
        const response = await apiClient.get<IReferralEvent[]>(
            `${CUSTOMER_BASE}/referrals/my-events`,
            {
                params: serializeQueryParams(params),
            },
        );

        return toPaginatedData(response);
    }

    async getAllReferralEventsForAdmin(
        params?: IReferralEventQueryParams,
    ): Promise<IPaginatedData<IReferralEvent>> {
        const response = await apiClient.get<IReferralEvent[]>(
            `${CUSTOMER_BASE}/referrals/events`,
            {
                params: serializeQueryParams(params),
            },
        );

        return toPaginatedData(response);
    }

    async overrideReferralStatus(
        payload: IOverrideReferralStatusPayload,
    ): Promise<IReferralEvent> {
        const response = await apiClient.patch<IReferralEvent>(
            `${CUSTOMER_BASE}/referrals/events/status`,
            payload,
        );

        return response.data;
    }

    // Reviews
    async getAllReviews(
        params?: IReviewQueryParams,
    ): Promise<IPaginatedData<IReview>> {
        const response = await apiClient.get<IReview[]>(
            `${CUSTOMER_BASE}/reviews`,
            {
                params: serializeQueryParams(params),
            },
        );

        return toPaginatedData(response);
    }

    async createReview(payload: ICreateReviewPayload): Promise<IReview> {
        const formData = toMultipartDataField(payload);

        const response = await apiClient.post<IReview>(
            `${CUSTOMER_BASE}/reviews`,
            formData,
            undefined,
        );

        return response.data;
    }

    async getMyReviews(
        params?: IReviewQueryParams,
    ): Promise<IPaginatedData<IReview>> {
        const response = await apiClient.get<IReview[]>(
            `${CUSTOMER_BASE}/reviews/my-reviews`,
            {
                params: serializeQueryParams(params),
            },
        );

        return toPaginatedData(response);
    }

    async updateReview(
        reviewId: string,
        payload: IUpdateReviewPayload,
    ): Promise<IReview> {
        const formData = toMultipartDataField(payload);

        const response = await apiClient.patch<IReview>(
            `${CUSTOMER_BASE}/reviews/${reviewId}`,
            formData,
            undefined,
        );

        return response.data;
    }

    async deleteReview(reviewId: string): Promise<IDeleteSuccessResponse> {
        const response = await apiClient.delete<IDeleteSuccessResponse>(
            `${CUSTOMER_BASE}/reviews/${reviewId}`,
        );

        return response.data;
    }

    async moderateReview(
        reviewId: string,
        payload: IModerateReviewPayload,
    ): Promise<IReview> {
        const response = await apiClient.patch<IReview>(
            `${CUSTOMER_BASE}/reviews/${reviewId}/moderate`,
            payload,
        );

        return response.data;
    }
}

export const customerApiClient = new CustomerApiClient();
