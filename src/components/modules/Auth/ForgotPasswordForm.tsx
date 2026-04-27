"use client";

/**
 * Forgot password form component
 * Allows user to request a password reset OTP via email
 */

import { forgetPasswordAction } from "@/app/(commonLayout)/(authRouteGroup)/forgot-password/_action";
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
    IForgetPasswordPayload,
    forgetPasswordZodSchema,
} from "@/zod/auth.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

const ForgotPasswordForm = () => {
    const [serverError, setServerError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const { mutateAsync, isPending } = useMutation({
        mutationFn: (payload: IForgetPasswordPayload) =>
            forgetPasswordAction(payload),
    });

    const form = useForm({
        defaultValues: {
            email: "",
        },

        onSubmit: async ({ value }) => {
            setServerError(null);
            setSuccessMessage(null);
            try {
                const result = (await mutateAsync(value)) as any;

                if (!result.success) {
                    setServerError(
                        result.message || "Password reset request failed",
                    );
                    return;
                }

                setSuccessMessage(result.message || "OTP sent to your email");
                form.reset();
            } catch (error: any) {
                console.log(`Password reset request failed: ${error.message}`);
                setServerError(
                    `Password reset request failed: ${error.message}`,
                );
            }
        },
    });

    return (
        <Card className="w-full max-w-md mx-auto shadow-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">
                    Reset Password
                </CardTitle>
                <CardDescription>
                    Enter your email address and we&apos;ll send you a code to
                    reset your password.
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
                            onChange: forgetPasswordZodSchema.shape.email,
                        }}
                    >
                        {(field) => (
                            <AppField
                                field={field}
                                label="Email Address"
                                type="email"
                                placeholder="Enter your email"
                            />
                        )}
                    </form.Field>

                    {serverError && (
                        <Alert variant={"destructive"}>
                            <AlertDescription>{serverError}</AlertDescription>
                        </Alert>
                    )}

                    {successMessage && (
                        <Alert
                            variant={"default"}
                            className="border-green-500 bg-green-50"
                        >
                            <AlertDescription className="text-green-800">
                                {successMessage}
                            </AlertDescription>
                        </Alert>
                    )}

                    <form.Subscribe
                        selector={(s) => [s.canSubmit, s.isSubmitting] as const}
                    >
                        {([canSubmit, isSubmitting]) => (
                            <AppSubmitButton
                                isPending={isSubmitting || isPending}
                                pendingLabel="Sending Code..."
                                disabled={!canSubmit}
                            >
                                Send Reset Code
                            </AppSubmitButton>
                        )}
                    </form.Subscribe>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        href="/login"
                        className="text-sm text-primary hover:underline underline-offset-4"
                    >
                        Back to Login
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};

export default ForgotPasswordForm;
