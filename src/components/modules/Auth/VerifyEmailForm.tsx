"use client";

/**
 * Identifier verification form component
 * Allows user to enter OTP to verify their email address or phone number
 */

import { verifyIdentifier } from "@/services/auth.service";
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
    IVerifyIdentifierPayload,
    verifyIdentifierZodSchema,
} from "@/zod/auth.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface VerifyEmailFormProps {
    identifier: string;
}

const VerifyEmailForm = ({ identifier }: VerifyEmailFormProps) => {
    const [serverError, setServerError] = useState<string | null>(null);
    const router = useRouter();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: (payload: IVerifyIdentifierPayload) =>
            verifyIdentifier(payload.identifier, payload.otp),
    });

    const form = useForm({
        defaultValues: {
            identifier: identifier || "",
            otp: "",
        },

        onSubmit: async ({ value }) => {
            setServerError(null);
            try {
                const result = await mutateAsync(value);

                if (!result) {
                    setServerError("Verification failed");
                    return;
                }

                toast.success("Verified successfully!");
                router.push("/login");
            } catch (error: any) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Verification failed";
                setServerError(message);
                toast.error(message);
            }
        },
    });

    return (
        <Card className="w-full max-w-md mx-auto shadow-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">
                    Verify Account
                </CardTitle>
                <CardDescription>
                    We&apos;ve sent a verification code. Please enter it below.
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
                        name="identifier"
                        validators={{
                            onChange: verifyIdentifierZodSchema.shape.identifier,
                        }}
                    >
                        {(field) => (
                            <AppField
                                field={field}
                                label="Email or Phone Number"
                                type="text"
                                placeholder="Enter your email or phone number"
                                disabled
                            />
                        )}
                    </form.Field>

                    <form.Field
                        name="otp"
                        validators={{
                            onChange: verifyIdentifierZodSchema.shape.otp,
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
                                Verify
                            </AppSubmitButton>
                        )}
                    </form.Subscribe>
                </form>
            </CardContent>
        </Card>
    );
};

export default VerifyEmailForm;
