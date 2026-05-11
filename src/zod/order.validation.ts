import { z } from "zod";

// ── Checkout Billing & Shipping Form ──────────────────
export const checkoutBillingFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z
        .string()
        .min(11, "Phone number must be at least 11 digits")
        .max(14, "Phone number is too long"),
    address: z.string().min(1, "Address is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    orderNote: z
        .string()
        .max(500, "Order note must be under 500 characters")
        .optional()
        .or(z.literal("")),
    city: z.string().min(1, "City is required"),
    area: z.string().min(1, "Area is required"),
});

export type CheckoutBillingFormValues = z.infer<
    typeof checkoutBillingFormSchema
>;

// ── Bkash TrxID Validation ────────────────────────────
export const bkashTrxIdSchema = z.object({
    trxId: z
        .string()
        .min(1, "Transaction ID is required")
        .length(10, "Transaction ID must be exactly 10 characters"),
});

export type BkashTrxIdValues = z.infer<typeof bkashTrxIdSchema>;

// ── Order Creation (matches backend contract) ─────────
export const createOrderZodSchema = z.object({
    fulfillmentMethod: z.enum(["DELIVERY", "PICKUP"]).optional(),
    paymentMethod: z.enum(["STRIPE", "COD"]).optional(),
    shippingAddressId: z.string().optional(),
    pickupLocationId: z.string().optional(),
    billingAddressSnapshot: z.record(z.string(), z.unknown()).optional(),
    notes: z.string().max(500, { message: "Notes too long" }).optional(),
    couponCode: z.string().optional(),
    redeemPoints: z.number().int().nonnegative().optional(),
    referralCode: z.string().optional(),
});

export type ICreateOrderPayload = z.infer<typeof createOrderZodSchema>;

export const updateOrderStatusZodSchema = z.object({
    status: z.enum([
        "PENDING_PAYMENT",
        "PAID",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "REFUNDED",
        "EXPIRED",
    ]),
});

export type IUpdateOrderStatusPayload = z.infer<
    typeof updateOrderStatusZodSchema
>;

export const initiatePaymentZodSchema = z.object({
    orderId: z.string().min(1, { message: "Order ID is required" }),
});

export type IInitiatePaymentPayload = z.infer<typeof initiatePaymentZodSchema>;

export const refundPaymentZodSchema = z.object({
    amount: z
        .coerce.number("Amount must be a number")
        .int({ message: "Amount must be an integer" })
        .nonnegative({ message: "Amount must be positive" }),
    reason: z.string().min(3, { message: "Reason is required" }),
});

export type IRefundPaymentPayload = z.infer<typeof refundPaymentZodSchema>;

export const collectCodZodSchema = z.object({
    collectedAt: z.string().min(1, { message: "Collected date is required" }),
    note: z.string().max(200, { message: "Note too long" }).optional(),
});

export type ICollectCodPayload = z.infer<typeof collectCodZodSchema>;
