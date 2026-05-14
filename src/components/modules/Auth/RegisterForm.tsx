"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { registerAction } from "@/app/(commonLayout)/(authRouteGroup)/register/_action";
import {
    IRegisterPayload,
    registerZodSchema,
    sendOtpZodSchema,
    verifyOtpZodSchema,
} from "@/zod/auth.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    AlertCircle,
    Eye,
    EyeOff,
    Loader2,
    UserPlus,
    Timer,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { sendOtp, verifyOtp } from "@/services/auth.service";
import { IdentifierField } from "./IdentifierField";
import { SegmentedOtpInput } from "./SegmentedOtpInput";

interface RegisterFormProps {
    redirectPath?: string;
    oauthError?: string;
    message?: string;
}

const getErrorMessage = (error: unknown): string => {
    if (typeof error === "string") return error;
    if (error && typeof error === "object" && "message" in error) {
        return (error as { message: string }).message;
    }
    return "Invalid input";
};

const mapOAuthError = (errorCode?: string): string | null => {
    if (!errorCode) return null;
    switch (errorCode) {
        case "oauth_failed":
            return "Google sign-up failed. Please try again.";
        case "session_expired":
            return "Your session expired. Please try again.";
        case "access_denied":
            return "Access denied. Please use another account.";
        default:
            return "Unable to complete Google sign-up.";
    }
};

const RegisterForm = ({
    redirectPath,
    oauthError,
    message,
}: RegisterFormProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isGoogleRedirecting, setIsGoogleRedirecting] = useState(false);
    const oauthErrorMessage = useMemo(
        () => mapOAuthError(oauthError),
        [oauthError],
    );
    const queryClient = useQueryClient();

    /* ── register flow state ────────────────────────────── */
    const [step, setStep] = useState<1 | 2>(1);
    const [verifiedIdentifier, setVerifiedIdentifier] = useState("");
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (oauthErrorMessage) toast.error(oauthErrorMessage);
        else if (message) toast(message);
    }, [oauthErrorMessage, message]);

    /* ── countdown timer ────────────────────────────────── */
    useEffect(() => {
        if (countdown <= 0) return;
        const id = setInterval(() => setCountdown((c) => c - 1), 1000);
        return () => clearInterval(id);
    }, [countdown]);

    /* ── Step 1: Send OTP mutation ──────────────────────── */
    const sendOtpMutation = useMutation({
        mutationFn: (identifier: string) => sendOtp(identifier),
        onSuccess: () => {
            toast.success("OTP sent successfully!");
            setCountdown(60);
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });

    /* ── Step 1: Verify OTP mutation ────────────────────── */
    const verifyOtpMutation = useMutation({
        mutationFn: ({ identifier, otp }: { identifier: string; otp: string }) =>
            verifyOtp(identifier, otp),
        onSuccess: () => {
            toast.success("Email verified! Please complete your profile.");
            setStep(2);
            setVerifiedIdentifier(step1Form.getFieldValue("identifier"));
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });

    /* ── Step 2: Register mutation ─────────────────────── */
    const { mutateAsync: registerMutate, isPending: isRegisterPending } =
        useMutation({
            mutationFn: (payload: IRegisterPayload) =>
                registerAction(payload, redirectPath),
        });

    /* ── Step 1 Form: Identifier + OTP ──────────────────── */
    const step1Form = useForm({
        defaultValues: { identifier: "", otp: "" },
        onSubmit: async ({ value }) => {
            if (!value.identifier) {
                toast.error("Please enter an email or phone number");
                return;
            }

            if (!value.otp) {
                toast.error("Please enter the OTP");
                return;
            }

            verifyOtpMutation.mutate({
                identifier: value.identifier,
                otp: value.otp,
            });
        },
    });

    /* ── Step 2 Form: Profile ───────────────────────────── */
    const step2Form = useForm({
        defaultValues: {
            name: "",
            password: "",
            confirmPassword: "",
        },
        onSubmit: async ({ value }) => {
            if (value.password !== value.confirmPassword) {
                toast.error("Passwords do not match");
                return;
            }

            try {
                const result = (await registerMutate({
                    identifier: verifiedIdentifier,
                    name: value.name,
                    password: value.password,
                    confirmPassword: value.confirmPassword,
                })) as any;
                if (!result?.success)
                    toast.error(result?.message || "Registration failed");
            } catch (error: any) {
                if (error?.digest?.startsWith("NEXT_REDIRECT")) {
                    queryClient.clear();
                    return;
                }
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Network error. Please retry.",
                );
            }
        },
    });

    const handleGoogleLogin = () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        if (!apiUrl) {
            toast.error("Authentication service URL is not configured.");
            return;
        }
        setIsGoogleRedirecting(true);
        window.location.href = `${apiUrl}/auth/login/google?state=${encodeURIComponent(redirectPath || "/")}`;
    };

    /* ── render ─────────────────────────────────────────── */

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="mb-8 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-widest uppercase mb-5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Register
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {step === 1 ? "Verify your identity" : "Create account"}
                </h1>
                <p className="text-muted-foreground text-sm mt-1.5">
                    {step === 1
                        ? "Step 1 of 2"
                        : "Step 2 of 2 — Complete your profile"}
                </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card shadow-xl shadow-black/5 p-8">
                {/* ─ STEP 1: Verify Identity ─ */}
                {step === 1 && (
                    <form
                        noValidate
                        onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            step1Form.handleSubmit();
                        }}
                        className="space-y-4"
                    >
                        {/* Identifier Field */}
                        <step1Form.Field
                            name="identifier"
                            validators={{
                                onChange:
                                    sendOtpZodSchema.shape.identifier,
                            }}
                        >
                            {(field) => (
                                <IdentifierField
                                    value={field.state.value}
                                    onChange={(val) => {
                                        field.handleChange(val);
                                        step1Form.setFieldValue("otp", "");
                                        sendOtpMutation.reset();
                                    }}
                                    onBlur={field.handleBlur}
                                    error={
                                        field.state.meta.errors?.[0]
                                            ? getErrorMessage(
                                                  field.state.meta
                                                      .errors[0],
                                              )
                                            : undefined
                                    }
                                    disabled={
                                        sendOtpMutation.isPending ||
                                        verifyOtpMutation.isPending
                                    }
                                />
                            )}
                        </step1Form.Field>

                        {/* Send OTP Button */}
                        {!sendOtpMutation.isPending &&
                        step1Form.getFieldValue("identifier") &&
                        !step1Form.getFieldValue("otp") ? (
                            <Button
                                type="button"
                                onClick={async () => {
                                    const identifier =
                                        step1Form.getFieldValue("identifier");
                                    if (identifier) {
                                        sendOtpMutation.mutate(identifier);
                                    }
                                }}
                                disabled={sendOtpMutation.isPending}
                                className="w-full h-11 font-semibold gap-2"
                            >
                                {sendOtpMutation.isPending ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Sending OTP...
                                    </>
                                ) : (
                                    "Send OTP"
                                )}
                            </Button>
                        ) : null}

                        {/* OTP Input & Verify (shown after send) */}
                        {sendOtpMutation.isSuccess && (
                            <div className="space-y-4 pt-2">
                                <step1Form.Field
                                    name="otp"
                                    validators={{
                                        onChange:
                                            verifyOtpZodSchema.shape.otp,
                                    }}
                                >
                                    {(field) => (
                                        <div className="space-y-2">
                                            <Label className="text-xs font-medium text-muted-foreground tracking-wide">
                                                Enter 6-digit OTP
                                            </Label>
                                            <SegmentedOtpInput
                                                value={field.state.value}
                                                onChange={(val) =>
                                                    field.handleChange(val)
                                                }
                                                disabled={
                                                    verifyOtpMutation.isPending
                                                }
                                            />
                                            {field.state.meta.errors?.[0] && (
                                                <p className="text-xs text-destructive">
                                                    {getErrorMessage(
                                                        field.state.meta
                                                            .errors[0],
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </step1Form.Field>

                                {/* Resend OTP with Cooldown */}
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const identifier =
                                                step1Form.getFieldValue(
                                                    "identifier",
                                                );
                                            if (identifier) {
                                                sendOtpMutation.mutate(
                                                    identifier,
                                                );
                                            }
                                        }}
                                        disabled={
                                            countdown > 0 ||
                                            sendOtpMutation.isPending
                                        }
                                        className="flex-1 text-xs"
                                    >
                                        {countdown > 0 ? (
                                            <>
                                                <Timer className="size-3 mr-1" />
                                                Resend in {countdown}s
                                            </>
                                        ) : (
                                            "Resend OTP"
                                        )}
                                    </Button>
                                </div>

                                {/* Verify Button */}
                                <step1Form.Subscribe
                                    selector={(s) =>
                                        [s.canSubmit, s.isSubmitting] as const
                                    }
                                >
                                    {([canSubmit, isSubmitting]) => (
                                        <Button
                                            type="submit"
                                            disabled={
                                                !canSubmit ||
                                                isSubmitting ||
                                                verifyOtpMutation.isPending
                                            }
                                            className="w-full h-11 font-semibold gap-2"
                                        >
                                            {isSubmitting ||
                                            verifyOtpMutation.isPending ? (
                                                <>
                                                    <Loader2 className="size-4 animate-spin" />
                                                    Verifying...
                                                </>
                                            ) : (
                                                "Verify OTP"
                                            )}
                                        </Button>
                                    )}
                                </step1Form.Subscribe>
                            </div>
                        )}
                    </form>
                )}

                {/* ─ STEP 2: Complete Profile ─ */}
                {step === 2 && (
                    <form
                        noValidate
                        onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            step2Form.handleSubmit();
                        }}
                        className="space-y-4"
                    >
                        {/* Read-only Identifier Display */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground tracking-wide">
                                Verified Email/Phone
                            </Label>
                            <Input
                                type="text"
                                value={verifiedIdentifier}
                                disabled
                                className="h-11 bg-background/50 border-border/60"
                            />
                        </div>

                        {/* Name Field */}
                        <step2Form.Field
                            name="name"
                            validators={{
                                onChange: registerZodSchema.shape.name,
                            }}
                        >
                            {(field) => (
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="name"
                                        className="text-xs font-medium text-muted-foreground tracking-wide"
                                    >
                                        Full Name
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="John Doe"
                                        value={field.state.value}
                                        onChange={(e) =>
                                            field.handleChange(e.target.value)
                                        }
                                        onBlur={field.handleBlur}
                                        disabled={isRegisterPending}
                                        className="h-11 bg-background/50 border-border/60 focus-visible:ring-primary/30"
                                    />
                                    {field.state.meta.errors?.[0] && (
                                        <p className="text-xs text-destructive">
                                            {getErrorMessage(
                                                field.state.meta.errors[0],
                                            )}
                                        </p>
                                    )}
                                </div>
                            )}
                        </step2Form.Field>

                        {/* Password Field */}
                        <step2Form.Field
                            name="password"
                            validators={{
                                onChange: registerZodSchema.shape.password,
                            }}
                        >
                            {(field) => (
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="reg-password"
                                        className="text-xs font-medium text-muted-foreground tracking-wide"
                                    >
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="reg-password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="Min 6 characters"
                                            value={field.state.value}
                                            onChange={(e) =>
                                                field.handleChange(
                                                    e.target.value,
                                                )
                                            }
                                            onBlur={field.handleBlur}
                                            disabled={isRegisterPending}
                                            className="h-11 bg-background/50 border-border/60 focus-visible:ring-primary/30 pr-11"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword((v) => !v)
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="size-4" />
                                            ) : (
                                                <Eye className="size-4" />
                                            )}
                                        </button>
                                    </div>
                                    {field.state.meta.errors?.[0] && (
                                        <p className="text-xs text-destructive">
                                            {getErrorMessage(
                                                field.state.meta.errors[0],
                                            )}
                                        </p>
                                    )}
                                </div>
                            )}
                        </step2Form.Field>

                        {/* Confirm Password Field */}
                        <step2Form.Field
                            name="confirmPassword"
                            validators={{
                                onChange:
                                    registerZodSchema.shape.confirmPassword,
                            }}
                        >
                            {(field) => (
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="confirmPassword"
                                        className="text-xs font-medium text-muted-foreground tracking-wide"
                                    >
                                        Confirm Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="Repeat password"
                                            value={field.state.value}
                                            onChange={(e) =>
                                                field.handleChange(
                                                    e.target.value,
                                                )
                                            }
                                            onBlur={field.handleBlur}
                                            disabled={isRegisterPending}
                                            className="h-11 bg-background/50 border-border/60 focus-visible:ring-primary/30 pr-11"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword((v) => !v)
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="size-4" />
                                            ) : (
                                                <Eye className="size-4" />
                                            )}
                                        </button>
                                    </div>
                                    {field.state.meta.errors?.[0] && (
                                        <p className="text-xs text-destructive">
                                            {getErrorMessage(
                                                field.state.meta.errors[0],
                                            )}
                                        </p>
                                    )}
                                </div>
                            )}
                        </step2Form.Field>

                        {/* Submit */}
                        <step2Form.Subscribe
                            selector={(s) =>
                                [s.canSubmit, s.isSubmitting] as const
                            }
                        >
                            {([canSubmit, isSubmitting]) => (
                                <Button
                                    type="submit"
                                    disabled={
                                        !canSubmit ||
                                        isSubmitting ||
                                        isRegisterPending
                                    }
                                    className="w-full h-11 font-semibold gap-2 mt-2"
                                >
                                    {isSubmitting || isRegisterPending ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="size-4" />{" "}
                                            Create Account
                                        </>
                                    )}
                                </Button>
                            )}
                        </step2Form.Subscribe>

                        {/* Back Button */}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-11"
                            onClick={() => {
                                setStep(1);
                                setVerifiedIdentifier("");
                                step1Form.reset();
                                step2Form.reset();
                            }}
                        >
                            Back
                        </Button>
                    </form>
                )}

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground">
                        or sign up with
                    </span>
                    <Separator className="flex-1" />
                </div>

                {/* Google */}
                <Button
                    variant="outline"
                    className="w-full h-11 border-border/60 hover:bg-accent/50 gap-2.5"
                    onClick={handleGoogleLogin}
                    disabled={isGoogleRedirecting}
                >
                    {isGoogleRedirecting ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <svg className="size-4" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                    )}
                    {isGoogleRedirecting
                        ? "Redirecting..."
                        : "Sign up with Google"}
                </Button>
            </div>

            {/* Footer */}
            <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{" "}
                <Link
                    href="/login"
                    className="text-primary font-medium hover:underline underline-offset-4"
                >
                    Sign In
                </Link>
            </p>
        </div>
    );
};

export default RegisterForm;
