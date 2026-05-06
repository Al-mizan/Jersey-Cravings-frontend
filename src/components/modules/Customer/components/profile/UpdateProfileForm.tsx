"use client";

import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ICustomerProfile, IUpdateMyProfilePayload } from "@/types/customer.types";
import { updateMyCustomerProfileZodSchema } from "@/zod/customer.validation";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { useUpdateMyCustomerProfile } from "../../hooks";

interface UpdateProfileFormProps {
    profile: ICustomerProfile;
}

const normalizeOptionalValue = (value: string): string | undefined => {
    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : undefined;
};

export const UpdateProfileForm = ({ profile }: UpdateProfileFormProps) => {
    const [serverError, setServerError] = useState<string | null>(null);
    const { mutateAsync, isPending } = useUpdateMyCustomerProfile();

    const form = useForm({
        defaultValues: {
            name: profile.name,
            contactNumber: profile.contactNumber ?? "",
            profilePhoto: profile.profilePhoto ?? "",
        },
        onSubmit: async ({ value }) => {
            setServerError(null);

            const payload: IUpdateMyProfilePayload = {
                name: normalizeOptionalValue(value.name),
                contactNumber: normalizeOptionalValue(value.contactNumber),
                profilePhoto: normalizeOptionalValue(value.profilePhoto),
            };

            const validationResult = updateMyCustomerProfileZodSchema.safeParse(payload);

            if (!validationResult.success) {
                const validationMessage =
                    validationResult.error.issues[0]?.message ?? "Validation failed";
                setServerError(validationMessage);
                return;
            }

            try {
                await mutateAsync(validationResult.data);
                toast.success("Profile updated successfully");
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : "Failed to update profile";
                setServerError(message);
            }
        },
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Update Profile</CardTitle>
            </CardHeader>

            <CardContent>
                <form
                    className="space-y-4"
                    noValidate
                    onSubmit={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        form.handleSubmit();
                    }}
                >
                    <form.Field name="name">
                        {(field) => (
                            <AppField
                                field={field}
                                label="Name"
                                placeholder="Enter your full name"
                            />
                        )}
                    </form.Field>

                    <form.Field name="contactNumber">
                        {(field) => (
                            <AppField
                                field={field}
                                label="Contact Number"
                                placeholder="01XXXXXXXXX"
                            />
                        )}
                    </form.Field>

                    <form.Field name="profilePhoto">
                        {(field) => (
                            <AppField
                                field={field}
                                label="Profile Photo URL"
                                placeholder="https://..."
                            />
                        )}
                    </form.Field>

                    {serverError && (
                        <Alert variant="destructive">
                            <AlertDescription>{serverError}</AlertDescription>
                        </Alert>
                    )}

                    <form.Subscribe
                        selector={(state) => [state.canSubmit, state.isSubmitting] as const}
                    >
                        {([canSubmit, isSubmitting]) => (
                            <AppSubmitButton
                                isPending={isSubmitting || isPending}
                                pendingLabel="Updating..."
                                disabled={!canSubmit}
                            >
                                Save Changes
                            </AppSubmitButton>
                        )}
                    </form.Subscribe>
                </form>
            </CardContent>
        </Card>
    );
};
