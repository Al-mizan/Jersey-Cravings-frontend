"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IContactPayload } from "@/zod/contact.validation";

export const contactService = {
    /**
     * Submit contact form
     */
    async submitContactForm(data: IContactPayload) {
        try {
            const response = await httpClient.post<any>("/contact", data);
            return response.data;
        } catch (error) {
            console.error("Error submitting contact form:", error);
            throw error;
        }
    },
};
