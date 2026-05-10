import { z } from "zod";

export const createProductZodSchema = z.object({
    title: z
        .string()
        .min(3, { message: "Title must be at least 3 characters" })
        .max(150, { message: "Title must not exceed 150 characters" }),
    slug: z
        .string()
        .min(3, { message: "Slug must be at least 3 characters" })
        .max(200, { message: "Slug must not exceed 200 characters" }),
    description: z
        .string()
        .max(2000, { message: "Description too long" })
        .optional(),
    teamName: z
        .string()
        .min(2, { message: "Team name must be at least 2 characters" })
        .max(100, { message: "Team name must not exceed 100 characters" }),
    tournamentTag: z
        .string()
        .max(100, { message: "Tournament tag must not exceed 100 characters" })
        .optional(),
    jerseyType: z.enum(["HOME", "AWAY", "THIRD", "GK", "SPECIAL"], {
        message: "Invalid jersey type",
    }),
    categoryId: z.string().uuid({ message: "Invalid category ID" }),
    thumbNail: z.string().url().optional(),
});

export type ICreateProductPayload = z.infer<typeof createProductZodSchema>;

export const updateProductZodSchema = z.object({
    title: z
        .string()
        .min(3, { message: "Title must be at least 3 characters" })
        .max(150, { message: "Title must not exceed 150 characters" })
        .optional(),
    slug: z
        .string()
        .min(3, { message: "Slug must be at least 3 characters" })
        .max(200, { message: "Slug must not exceed 200 characters" })
        .optional(),
    description: z
        .string()
        .max(2000, { message: "Description too long" })
        .optional(),
    teamName: z
        .string()
        .min(2, { message: "Team name must be at least 2 characters" })
        .max(100, { message: "Team name must not exceed 100 characters" })
        .optional(),
    tournamentTag: z
        .string()
        .max(100, { message: "Tournament tag must not exceed 100 characters" })
        .optional(),
    jerseyType: z
        .enum(["HOME", "AWAY", "THIRD", "GK", "SPECIAL"], {
            message: "Invalid jersey type",
        })
        .optional(),
    categoryId: z.string().uuid({ message: "Invalid category ID" }).optional(),
    thumbNail: z.string().url().optional(),
});

export type IUpdateProductPayload = z.infer<typeof updateProductZodSchema>;

export const updateProductStatusZodSchema = z.object({
    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"], {
        message: "Invalid product status",
    }),
});

export type IUpdateProductStatusPayload = z.infer<
    typeof updateProductStatusZodSchema
>;

export const createCategoryZodSchema = z.object({
    name: z
        .string()
        .min(2, { message: "Name must be at least 2 characters" })
        .max(120, { message: "Name must not exceed 120 characters" }),
    slug: z
        .string()
        .min(2, { message: "Slug must be at least 2 characters" })
        .max(160, { message: "Slug must not exceed 160 characters" }),
});

export type ICreateCategoryPayload = z.infer<typeof createCategoryZodSchema>;

export const updateCategoryZodSchema = z.object({
    name: z
        .string()
        .min(2, { message: "Name must be at least 2 characters" })
        .max(120, { message: "Name must not exceed 120 characters" })
        .optional(),
    slug: z
        .string()
        .min(2, { message: "Slug must be at least 2 characters" })
        .max(160, { message: "Slug must not exceed 160 characters" })
        .optional(),
    isActive: z.boolean().optional(),
});

export type IUpdateCategoryPayload = z.infer<typeof updateCategoryZodSchema>;

export const createVariantZodSchema = z.object({
    sku: z
        .string()
        .min(3, { message: "SKU must be at least 3 characters" })
        .max(50, { message: "SKU must not exceed 50 characters" }),
    size: z.enum(["S", "M", "L", "XL", "XXL"], {
        message: "Invalid size",
    }),
    fit: z.enum(["PLAYER", "FAN"], { message: "Invalid fit" }),
    sleeveType: z.enum(["SHORT", "LONG"], { message: "Invalid sleeve type" }),
    priceAmount: z.coerce
        .number("Price must be a number")
        .int({ message: "Price must be an integer" })
        .nonnegative({ message: "Price must be positive" }),
    compareAtAmount: z.coerce
        .number("Compare price must be a number")
        .int({ message: "Compare price must be an integer" })
        .nonnegative({ message: "Compare price must be positive" })
        .optional(),
    costAmount: z.coerce
        .number("Cost must be a number")
        .int({ message: "Cost must be an integer" })
        .nonnegative({ message: "Cost must be positive" })
        .optional(),
    stockQty: z.coerce
        .number("Stock must be a number")
        .int({ message: "Stock must be an integer" })
        .nonnegative({ message: "Stock must be positive" }),
});

export type ICreateVariantPayload = z.infer<typeof createVariantZodSchema>;

export const updateVariantZodSchema = z.object({
    priceAmount: z.coerce
        .number("Price must be a number")
        .int({ message: "Price must be an integer" })
        .nonnegative({ message: "Price must be positive" })
        .optional(),
    compareAtAmount: z.coerce
        .number("Compare price must be a number")
        .int({ message: "Compare price must be an integer" })
        .nonnegative({ message: "Compare price must be positive" })
        .optional(),
    costAmount: z.coerce
        .number("Cost must be a number")
        .int({ message: "Cost must be an integer" })
        .nonnegative({ message: "Cost must be positive" })
        .optional(),
    stockQty: z.coerce
        .number("Stock must be a number")
        .int({ message: "Stock must be an integer" })
        .nonnegative({ message: "Stock must be positive" })
        .optional(),
    isActive: z.boolean().optional(),
});

export type IUpdateVariantPayload = z.infer<typeof updateVariantZodSchema>;

export const createProductMediaZodSchema = z.object({
    altText: z.string().max(200, { message: "Alt text too long" }).optional(),
});

export type ICreateProductMediaPayload = z.infer<
    typeof createProductMediaZodSchema
>;

export const updateProductMediaZodSchema = z.object({
    altText: z.string().max(200, { message: "Alt text too long" }).optional(),
});

export type IUpdateProductMediaPayload = z.infer<
    typeof updateProductMediaZodSchema
>;

export const reorderProductMediaZodSchema = z.object({
    mediaOrder: z.array(
        z.object({
            id: z.string().uuid({ message: "Invalid media ID" }),
            sortOrder: z.number().int().nonnegative(),
        }),
    ),
});

export type IReorderProductMediaPayload = z.infer<
    typeof reorderProductMediaZodSchema
>;
