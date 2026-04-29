import { z } from "zod";

export const addToCartZodSchema = z.object({
    variantId: z.string().uuid({ message: "Invalid variant ID" }),
    qty: z.coerce
        .number("Qty must be a number")
        .int({ message: "Qty must be an integer" })
        .positive({ message: "Qty must be at least 1" }),
});

export type IAddToCartPayload = z.infer<typeof addToCartZodSchema>;

export const updateCartItemZodSchema = z.object({
    qty: z.coerce
        .number("Qty must be a number")
        .int({ message: "Qty must be an integer" })
        .positive({ message: "Qty must be at least 1" }),
});

export type IUpdateCartItemPayload = z.infer<typeof updateCartItemZodSchema>;

export const validateCouponZodSchema = z.object({
    code: z.string().min(3, { message: "Coupon code is required" }),
    orderAmount: z.coerce
        .number("Order amount must be a number")
        .int({ message: "Order amount must be an integer" })
        .nonnegative({ message: "Order amount must be positive" }),
});

export type IValidateCouponPayload = z.infer<typeof validateCouponZodSchema>;

export const createCouponZodSchema = z.object({
    code: z.string().min(3, { message: "Coupon code is required" }),
    discountType: z.enum(["PERCENT", "FLAT"], {
        message: "Invalid discount type",
    }),
    value: z.coerce
        .number("Value must be a number")
        .int({ message: "Value must be an integer" })
        .nonnegative({ message: "Value must be positive" }),
    minOrderAmount: z.coerce
        .number("Min amount must be a number")
        .int({ message: "Min amount must be an integer" })
        .nonnegative({ message: "Min amount must be positive" })
        .optional(),
    maxDiscountAmount: z.coerce
        .number("Max amount must be a number")
        .int({ message: "Max amount must be an integer" })
        .nonnegative({ message: "Max amount must be positive" })
        .optional(),
    startsAt: z.string().optional(),
    endsAt: z.string().optional(),
    isActive: z.boolean().optional(),
});

export type ICreateCouponPayload = z.infer<typeof createCouponZodSchema>;

export const updateCouponZodSchema = z.object({
    value: z.coerce
        .number("Value must be a number")
        .int({ message: "Value must be an integer" })
        .nonnegative({ message: "Value must be positive" })
        .optional(),
    minOrderAmount: z.coerce
        .number("Min amount must be a number")
        .int({ message: "Min amount must be an integer" })
        .nonnegative({ message: "Min amount must be positive" })
        .optional(),
    maxDiscountAmount: z.coerce
        .number("Max amount must be a number")
        .int({ message: "Max amount must be an integer" })
        .nonnegative({ message: "Max amount must be positive" })
        .optional(),
    startsAt: z.string().optional(),
    endsAt: z.string().optional(),
    isActive: z.boolean().optional(),
});

export type IUpdateCouponPayload = z.infer<typeof updateCouponZodSchema>;

export const createPickupLocationZodSchema = z.object({
    name: z.string().min(2, { message: "Name is required" }),
    addressLine: z.string().min(3, { message: "Address is required" }),
    city: z.string().min(2, { message: "City is required" }),
    district: z.string().min(2, { message: "District is required" }),
    postalCode: z.string().optional(),
    phone: z.string().min(6, { message: "Phone is required" }),
    openingHours: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    isDefault: z.boolean().optional(),
});

export type ICreatePickupLocationPayload = z.infer<
    typeof createPickupLocationZodSchema
>;

export const updatePickupLocationZodSchema = z.object({
    name: z.string().min(2, { message: "Name is required" }).optional(),
    addressLine: z
        .string()
        .min(3, { message: "Address is required" })
        .optional(),
    city: z.string().min(2, { message: "City is required" }).optional(),
    district: z.string().min(2, { message: "District is required" }).optional(),
    postalCode: z.string().optional(),
    phone: z.string().min(6, { message: "Phone is required" }).optional(),
    openingHours: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    isDefault: z.boolean().optional(),
});

export type IUpdatePickupLocationPayload = z.infer<
    typeof updatePickupLocationZodSchema
>;

export const upsertGiftAddonZodSchema = z.object({
    isGiftWrap: z.boolean().optional(),
    giftMessage: z
        .string()
        .max(200, { message: "Message too long" })
        .optional(),
});

export type IUpsertGiftAddonPayload = z.infer<typeof upsertGiftAddonZodSchema>;
