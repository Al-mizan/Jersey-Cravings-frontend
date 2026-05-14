import { z } from "zod";

/**
 * Contact form validation schema
 */
export const contactZodSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    phone: z
        .string()
        .min(11, "Phone number must be at least 11 digits")
        .max(14, "Phone number must not exceed 14 digits")
        .regex(/^01[3-9]\d{8}$/, "Please enter a valid Bangladesh phone number"),
    subject: z.string().min(1, "Please select a subject"),
    message: z
        .string()
        .min(10, "Message must be at least 10 characters")
        .max(1000, "Message must not exceed 1000 characters"),
});

export type IContactPayload = z.infer<typeof contactZodSchema>;
