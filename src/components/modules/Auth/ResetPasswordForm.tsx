"use client";

/**
 * Reset password form component
 * Allows user to reset password using OTP and new password
 */

import { resetPasswordAction } from "@/app/(commonLayout)/(authRouteGroup)/reset-password/_action";
import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    IResetPasswordPayload,
    resetPasswordZodSchema,
} from "@/zod/auth.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface ResetPasswordFormProps {
    identifier: string;
}

const ResetPasswordForm = ({ identifier }: ResetPasswordFormProps) => {
    const [serverError, setServerError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const { mutateAsync, isPending } = useMutation({
        mutationFn: (payload: IResetPasswordPayload) =>
            resetPasswordAction(payload),
    });

    const form = useForm({
        defaultValues: {
            identifier: identifier || "",
            otp: "",
            newPassword: "",
        },

        onSubmit: async ({ value }) => {
            setServerError(null);
            try {
                const result = (await mutateAsync(value)) as any;

                if (!result.success) {
                    setServerError(result.message || "Password reset failed");
                    return;
                }
            } catch (error: any) {
                console.log(`Password reset failed: ${error.message}`);
                setServerError(`Password reset failed: ${error.message}`);
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
                    Enter the code we sent to your email or phone and your new password.
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
                            onChange: resetPasswordZodSchema.shape.identifier,
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
                            onChange: resetPasswordZodSchema.shape.otp,
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

                    <form.Field
                        name="newPassword"
                        validators={{
                            onChange: resetPasswordZodSchema.shape.newPassword,
                        }}
                    >
                        {(field) => (
                            <AppField
                                field={field}
                                label="New Password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your new password (min 6 characters)"
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                                className="cursor-pointer"
                                append={
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((value) => !value)
                                        }
                                        variant="ghost"
                                        size="icon"
                                    >
                                        {showPassword ? (
                                            <EyeOff
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <Eye
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </Button>
                                }
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
                                pendingLabel="Resetting Password..."
                                disabled={!canSubmit}
                            >
                                Reset Password
                            </AppSubmitButton>
                        )}
                    </form.Subscribe>
                </form>
            </CardContent>
        </Card>
    );
};

export default ResetPasswordForm;
