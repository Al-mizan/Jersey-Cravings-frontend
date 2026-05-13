import { z } from "zod";
import { getDivisionForDistrict } from "@/lib/bd-locations";

// ── Checkout Billing & Shipping Form ──────────────────
export const checkoutBillingFormSchema = z
    .object({
        name: z.string().min(1, "Name is required"),
        phone: z
            .string()
            .min(11, "Phone number must be at least 11 digits")
            .max(14, "Phone number is too long"),
        address: z.string(),
        email: z
            .string()
            .email("Invalid email address")
            .optional()
            .or(z.literal("")),
        orderNote: z
            .string()
            .max(500, "Order note must be under 500 characters")
            .optional()
            .or(z.literal("")),
        shippingMethod: z.string().min(1, "Please select a shipping method"),
        division: z.string(),
        district: z.string(),
        area: z.string(),
    })
    .superRefine((value, ctx) => {
        const isPickup = value.shippingMethod === "ju";
        const selectedDivision = value.division.trim().toLowerCase();
        const selectedDistrict = value.district.trim().toLowerCase();

        if (isPickup) return;

        // For delivery, all location fields are required
        if (!value.division.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["division"],
                message: "Division is required",
            });
        }

        if (!value.district.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["district"],
                message: "District is required",
            });
        }

        if (!value.area.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["area"],
                message: "Area is required",
            });
        }

        if (!value.address.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["address"],
                message: "Address is required",
            });
        }

        if (value.shippingMethod === "dhaka" && selectedDistrict !== "dhaka") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["district"],
                message: "Delivery Inside Dhaka requires the Dhaka district",
            });
        }

        if (
            value.shippingMethod === "outside" &&
            selectedDistrict === "dhaka"
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["district"],
                message:
                    "Delivery Outside Dhaka requires a district outside Dhaka",
            });
        }

        const expectedDivision = getDivisionForDistrict(selectedDistrict);
        if (
            expectedDivision &&
            selectedDivision &&
            expectedDivision !== selectedDivision
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["division"],
                message: "Selected division does not match the chosen district",
            });
        }
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
    paymentMethod: z.enum(["BKASH", "NAGAD", "COD"]).optional(),
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
    amount: z.coerce
        .number("Amount must be a number")
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
