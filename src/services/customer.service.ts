import { customerApiClient } from "@/components/modules/Customer";
import {
    IAddressQueryParams,
    IChangeCustomerStatusPayload,
    ICreateAddressPayload,
    ICreateReviewPayload,
    ICustomerQueryParams,
    IModerateReviewPayload,
    IPointTransactionQueryParams,
    IReferralEventQueryParams,
    IReviewQueryParams,
    IUpdateAddressPayload,
    IUpdateLoyaltySettingPayload,
    IUpdateMyProfilePayload,
    IUpdateReviewPayload,
    IOverrideReferralStatusPayload,
} from "@/types/customer.types";

export const customerServices = {
    getMyProfile: () => customerApiClient.getMyProfile(),
    updateMyProfile: (payload: IUpdateMyProfilePayload) =>
        customerApiClient.updateMyProfile(payload),

    getAllCustomers: (params?: ICustomerQueryParams) =>
        customerApiClient.getAllCustomers(params),
    getCustomerById: (customerId: string) =>
        customerApiClient.getCustomerById(customerId),
    changeCustomerStatus: (payload: IChangeCustomerStatusPayload) =>
        customerApiClient.changeCustomerStatus(payload),
    restoreCustomer: (customerId: string) =>
        customerApiClient.restoreCustomer(customerId),

    getMyAddresses: (params?: IAddressQueryParams) =>
        customerApiClient.getMyAddresses(params),
    createAddress: (payload: ICreateAddressPayload) =>
        customerApiClient.createAddress(payload),
    updateAddress: (addressId: string, payload: IUpdateAddressPayload) =>
        customerApiClient.updateAddress(addressId, payload),
    deleteAddress: (addressId: string) => customerApiClient.deleteAddress(addressId),

    getMyLoyaltySummary: () => customerApiClient.getMyLoyaltySummary(),
    getMyPointTransactions: (params?: IPointTransactionQueryParams) =>
        customerApiClient.getMyPointTransactions(params),
    getActiveLoyaltySetting: () => customerApiClient.getActiveLoyaltySetting(),
    updateLoyaltySetting: (payload: IUpdateLoyaltySettingPayload) =>
        customerApiClient.updateLoyaltySetting(payload),

    getOrCreateMyReferralCode: () => customerApiClient.getOrCreateMyReferralCode(),
    getMyReferralEvents: (params?: IReferralEventQueryParams) =>
        customerApiClient.getMyReferralEvents(params),
    getAllReferralEventsForAdmin: (params?: IReferralEventQueryParams) =>
        customerApiClient.getAllReferralEventsForAdmin(params),
    overrideReferralStatus: (payload: IOverrideReferralStatusPayload) =>
        customerApiClient.overrideReferralStatus(payload),

    getAllReviews: (params?: IReviewQueryParams) =>
        customerApiClient.getAllReviews(params),
    createReview: (payload: ICreateReviewPayload) =>
        customerApiClient.createReview(payload),
    getMyReviews: (params?: IReviewQueryParams) =>
        customerApiClient.getMyReviews(params),
    updateReview: (reviewId: string, payload: IUpdateReviewPayload) =>
        customerApiClient.updateReview(reviewId, payload),
    deleteReview: (reviewId: string) => customerApiClient.deleteReview(reviewId),
    moderateReview: (reviewId: string, payload: IModerateReviewPayload) =>
        customerApiClient.moderateReview(reviewId, payload),
};
