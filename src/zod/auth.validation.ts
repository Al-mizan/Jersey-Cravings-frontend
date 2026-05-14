import { z } from "zod";

// Phone validation: accept 01XXXXXXXXX, 8801XXXXXXXXX, +8801XXXXXXXXX
const BD_PHONE_PATTERN = /^(\+88|88)?01\d{9}$/;

const phoneValidator = z
    .string()
    .refine(
        (phone) => BD_PHONE_PATTERN.test(phone.replace(/\s/g, "")),
        "Invalid Bangladeshi phone number. Use 01XXXXXXXXX, 8801XXXXXXXXX, or +8801XXXXXXXXX",
    );

const emailOrPhoneValidator = z.string().refine((val) => {
    const trimmed = val.trim();
    return (
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(trimmed) ||
        BD_PHONE_PATTERN.test(trimmed.replace(/\s/g, ""))
    );
}, "Invalid email or Bangladeshi phone number");

/**
 * Updated login schema with identifier (email or phone)
 */
export const loginZodSchema = z.object({
    identifier: emailOrPhoneValidator,
    password: z
        .string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters"),
});

export type ILoginPayload = z.infer<typeof loginZodSchema>;

/**
 * Register schema with identifier (email or phone)
 */
export const registerZodSchema = z.object({
    identifier: emailOrPhoneValidator,
    name: z.string().min(1, "Name is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
});

export const registerZodSchemaWithConfirm = registerZodSchema.refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    },
);

export type IRegisterPayload = z.infer<typeof registerZodSchemaWithConfirm>;

/**
 * Send OTP schema
 */
export const sendOtpZodSchema = z.object({
    identifier: emailOrPhoneValidator,
});

export type ISendOtpPayload = z.infer<typeof sendOtpZodSchema>;

/**
 * Verify OTP schema
 */
export const verifyOtpZodSchema = z.object({
    identifier: emailOrPhoneValidator,
    otp: z
        .string()
        .length(6, "OTP must be exactly 6 digits")
        .regex(/^\d+$/, "OTP must contain only digits"),
});

export type IVerifyOtpPayload = z.infer<typeof verifyOtpZodSchema>;

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
export const verifyIdentifierZodSchema = z.object({
    identifier: emailOrPhoneValidator,
    otp: z.string().min(1, "OTP is required"),
});

export type IVerifyIdentifierPayload = z.infer<typeof verifyIdentifierZodSchema>;

/**
 * Forget password validation schema
 * Mirrors backend: forgetPasswordZodSchema
 */
export const forgetPasswordZodSchema = z.object({
    identifier: emailOrPhoneValidator,
});

export type IForgetPasswordPayload = z.infer<typeof forgetPasswordZodSchema>;

/**
 * Reset password validation schema
 * Mirrors backend: resetPasswordZodSchema
 */
export const resetPasswordZodSchema = z.object({
    identifier: emailOrPhoneValidator,
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
    register: registerZodSchemaWithConfirm,
    login: loginZodSchema,
    changePassword: changePasswordZodSchema,
    verifyIdentifier: verifyIdentifierZodSchema,
    forgetPassword: forgetPasswordZodSchema,
    resetPassword: resetPasswordZodSchema,
    sendOtp: sendOtpZodSchema,
    verifyOtp: verifyOtpZodSchema,
};
