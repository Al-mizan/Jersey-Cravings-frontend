import { z } from "zod";

// Create Admin Schema
export const createAdminZodSchema = z.object({
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters" })
        .max(50, { message: "Password must not exceed 50 characters" }),
    role: z.enum(["ADMIN", "SUPER_ADMIN"], {
        message: "Role must be either ADMIN or SUPER_ADMIN",
    }),
    admin: z.object({
        name: z
            .string()
            .min(2, { message: "Name must be at least 2 characters" })
            .max(100, { message: "Name must not exceed 100 characters" }),
        identifier: z.string().min(1, { message: "Identifier is required" }).max(50, { message: "Identifier must not exceed 50 characters" }),
        contactNumber: z
            .string()
            .min(11, {
                message: "Contact number must be at least 11 characters",
            })
            .optional(),
        profilePhoto: z.string().url({ message: "Invalid URL" }).optional(),
    }),
});

export type ICreateAdminPayload = z.infer<typeof createAdminZodSchema>;

// Update Admin Schema
export const updateAdminZodSchema = z.object({
    name: z
        .string()
        .min(2, { message: "Name must be at least 2 characters" })
        .max(100, { message: "Name must not exceed 100 characters" })
        .optional(),
    contactNumber: z
        .string()
        .min(11, { message: "Contact number must be at least 11 characters" })
        .optional(),
    profilePhoto: z.string().url({ message: "Invalid URL" }).optional(),
});

export type IUpdateAdminPayload = z.infer<typeof updateAdminZodSchema>;

// Change User Status Schema
export const changeUserStatusZodSchema = z.object({
    userId: z.string().uuid({ message: "Invalid user ID" }),
    status: z.enum(["ACTIVE", "BLOCKED", "DELETED"], {
        message: "Status must be one of: ACTIVE, BLOCKED, DELETED",
    }),
});

export type IChangeUserStatusPayload = z.infer<
    typeof changeUserStatusZodSchema
>;

// Change User Role Schema
export const changeUserRoleZodSchema = z.object({
    userId: z.string().uuid({ message: "Invalid user ID" }),
    role: z.enum(["ADMIN", "SUPER_ADMIN"], {
        message: "Role must be either ADMIN or SUPER_ADMIN",
    }),
});

export type IChangeUserRolePayload = z.infer<typeof changeUserRoleZodSchema>;
