"use client";

/**
 * Email verification form component
 * Allows user to enter OTP to verify their email address
 */

import { verifyEmail } from "@/services/auth.service";
import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    IVerifyEmailPayload,
    verifyEmailZodSchema,
} from "@/zod/auth.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface VerifyEmailFormProps {
    email: string;
}

const VerifyEmailForm = ({ email }: VerifyEmailFormProps) => {
    const [serverError, setServerError] = useState<string | null>(null);

    const { mutateAsync, isPending } = useMutation({
        mutationFn: (payload: IVerifyEmailPayload) =>
            verifyEmail(payload.email, payload.otp),
    });

    const form = useForm({
        defaultValues: {
            email: email || "",
            otp: "",
        },

        onSubmit: async ({ value }) => {
            setServerError(null);
            try {
                const result = await mutateAsync(value);

                if (!result) {
                    setServerError("Email verification failed");
                    return;
                }

                toast.success("Email verified successfully!");
            } catch (error: any) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Email verification failed";
                setServerError(message);
                toast.error(message);
            }
        },
    });

    return (
        <Card className="w-full max-w-md mx-auto shadow-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">
                    Verify Email
                </CardTitle>
                <CardDescription>
                    We&apos;ve sent a verification code to your email. Please
                    enter it below.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form
                    method="POST"
                    action="#"
                    noValidate
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                    className="space-y-4"
                >
                    <form.Field
                        name="email"
                        validators={{
                            onChange: verifyEmailZodSchema.shape.email,
                        }}
                    >
                        {(field) => (
                            <AppField
                                field={field}
                                label="Email"
                                type="email"
                                placeholder="Enter your email"
                                disabled
                            />
                        )}
                    </form.Field>

                    <form.Field
                        name="otp"
                        validators={{
                            onChange: verifyEmailZodSchema.shape.otp,
                        }}
                    >
                        {(field) => (
                            <AppField
                                field={field}
                                label="Verification Code"
                                type="text"
                                placeholder="Enter the 6-digit code"
                                inputMode="numeric"
                            />
                        )}
                    </form.Field>

                    {serverError && (
                        <Alert variant={"destructive"}>
                            <AlertDescription>{serverError}</AlertDescription>
                        </Alert>
                    )}

                    <form.Subscribe
                        selector={(s) => [s.canSubmit, s.isSubmitting] as const}
                    >
                        {([canSubmit, isSubmitting]) => (
                            <AppSubmitButton
                                isPending={isSubmitting || isPending}
                                pendingLabel="Verifying..."
                                disabled={!canSubmit}
                            >
                                Verify Email
                            </AppSubmitButton>
                        )}
                    </form.Subscribe>
                </form>
            </CardContent>
        </Card>
    );
};

export default VerifyEmailForm;
