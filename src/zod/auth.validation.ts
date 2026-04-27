import { z } from "zod";

/**
 * Register validation schema
 * Mirrors backend: registerCustomerZodSchema
 */
export const registerZodSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Email must be valid"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export type IRegisterPayload = z.infer<typeof registerZodSchema>;

/**
 * Login validation schema
 * Mirrors backend: loginUserZodSchema
 */
export const loginZodSchema = z.object({
    email: z.email("Email must be valid"),
    password: z
        .string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters"),
});

export type ILoginPayload = z.infer<typeof loginZodSchema>;

/**
 * Change password validation schema
 * Mirrors backend: changePasswordZodSchema
 */
export const changePasswordZodSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
        .string()
        .min(6, "New password must be at least 6 characters"),
});

export type IChangePasswordPayload = z.infer<typeof changePasswordZodSchema>;

/**
 * Verify email validation schema
 * Mirrors backend: verifyEmailZodSchema
 */
export const verifyEmailZodSchema = z.object({
    email: z.email("Email must be valid"),
    otp: z.string().min(1, "OTP is required"),
});

export type IVerifyEmailPayload = z.infer<typeof verifyEmailZodSchema>;

/**
 * Forget password validation schema
 * Mirrors backend: forgetPasswordZodSchema
 */
export const forgetPasswordZodSchema = z.object({
    email: z.email("Email must be valid"),
});

export type IForgetPasswordPayload = z.infer<typeof forgetPasswordZodSchema>;

/**
 * Reset password validation schema
 * Mirrors backend: resetPasswordZodSchema
 */
export const resetPasswordZodSchema = z.object({
    email: z.email("Email must be valid"),
    otp: z.string().min(1, "OTP is required"),
    newPassword: z
        .string()
        .min(6, "New password must be at least 6 characters"),
});

export type IResetPasswordPayload = z.infer<typeof resetPasswordZodSchema>;

/**
 * Consolidated auth validation schemas export
 */
export const authValidationSchemas = {
    register: registerZodSchema,
    login: loginZodSchema,
    changePassword: changePasswordZodSchema,
    verifyEmail: verifyEmailZodSchema,
    forgetPassword: forgetPasswordZodSchema,
    resetPassword: resetPasswordZodSchema,
};
