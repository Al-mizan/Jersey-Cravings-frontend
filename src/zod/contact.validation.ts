import { z } from "zod";

/**
 * Contact form validation schema
 */
export const contactZodSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    credential: z.string().optional().default("Not Provided"),
    subject: z.string().min(1, "Please select a subject"),
    message: z
        .string()
        .min(10, "Message must be at least 10 characters")
        .max(1000, "Message must not exceed 1000 characters"),
});

export type IContactPayload = z.infer<typeof contactZodSchema>;
