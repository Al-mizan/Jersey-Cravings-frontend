import { z } from "zod";

export const createOrderZodSchema = z.object({
    addressId: z.string().uuid({ message: "Invalid address ID" }).optional(),
    pickupLocationId: z
        .string()
        .uuid({ message: "Invalid pickup location ID" })
        .optional(),
    couponCode: z.string().min(3, { message: "Invalid coupon code" }).optional(),
    notes: z.string().max(500, { message: "Notes too long" }).optional(),
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
    orderId: z.string().uuid({ message: "Invalid order ID" }),
    paymentMethod: z.enum(["STRIPE", "COD"], {
        message: "Invalid payment method",
    }),
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
