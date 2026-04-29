import { z } from "zod";

const reviewMediaSchema = z.object({
    publicId: z.string().min(1, "Public ID is required"),
    secureUrl: z.url("Media URL must be valid"),
    resourceType: z.string().min(1, "Resource type is required"),
});

export const updateMyCustomerProfileZodSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    profilePhoto: z.url("Profile photo must be a valid URL").optional(),
    contactNumber: z.string().min(6, "Contact number is invalid").optional(),
});

export const changeCustomerStatusZodSchema = z.object({
    customerId: z.string().min(1, "Customer ID is required"),
    status: z.enum(["ACTIVE", "BLOCKED", "DELETED"]),
});

export const createAddressZodSchema = z.object({
    recipientName: z.string().min(1, "Recipient name is required"),
    phone: z.string().min(6, "Phone is required"),
    address: z.string().min(1, "Address is required"),
    area: z.string().min(1, "Area is required"),
    district: z.string().min(1, "District is required"),
    division: z.string().min(1, "Division is required"),
    isDefault: z.boolean().optional(),
});

export const updateAddressZodSchema = z.object({
    recipientName: z.string().min(1).optional(),
    phone: z.string().min(6).optional(),
    address: z.string().min(1).optional(),
    area: z.string().min(1).optional(),
    district: z.string().min(1).optional(),
    division: z.string().min(1).optional(),
    isDefault: z.boolean().optional(),
});

export const updateLoyaltySettingZodSchema = z.object({
    earnRateBps: z.number().int().min(0).max(10000).optional(),
    minPurchasedQtyToRedeem: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
});

export const overrideReferralStatusZodSchema = z.object({
    referralEventId: z.string().min(1, "Referral event ID is required"),
    status: z.enum(["PENDING", "REWARDED", "REJECTED"]),
});

export const createReviewZodSchema = z.object({
    productId: z.string().min(1, "Product ID is required"),
    rating: z
        .number({ message: "Rating is required" })
        .min(1, "Rating must be at least 1")
        .max(5, "Rating cannot be more than 5"),
    comment: z.string().optional(),
    medias: z.array(reviewMediaSchema).max(6).optional(),
});

export const updateReviewZodSchema = z.object({
    rating: z
        .number({ message: "Rating is required" })
        .min(1, "Rating must be at least 1")
        .max(5, "Rating cannot be more than 5")
        .optional(),
    comment: z.string().optional(),
    medias: z.array(reviewMediaSchema).max(6).optional(),
});

export const moderateReviewZodSchema = z.object({
    isApproved: z.boolean(),
});

export type IUpdateMyProfilePayload = z.infer<
    typeof updateMyCustomerProfileZodSchema
>;

export type IChangeCustomerStatusPayload = z.infer<
    typeof changeCustomerStatusZodSchema
>;

export type ICreateAddressPayload = z.infer<typeof createAddressZodSchema>;

export type IUpdateAddressPayload = z.infer<typeof updateAddressZodSchema>;

export type IUpdateLoyaltySettingPayload = z.infer<
    typeof updateLoyaltySettingZodSchema
>;

export type IOverrideReferralStatusPayload = z.infer<
    typeof overrideReferralStatusZodSchema
>;

export type ICreateReviewPayload = z.infer<typeof createReviewZodSchema>;

export type IUpdateReviewPayload = z.infer<typeof updateReviewZodSchema>;

export type IModerateReviewPayload = z.infer<typeof moderateReviewZodSchema>;
