"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { motion, AnimatePresence } from "motion/react";
import { z } from "zod";
import { getMyProfile, updateMyProfile } from "@/services/customer.service";
import { verifyEmail, sendVerificationOtp } from "@/services/auth.service";
import { customerProfileKeys } from "@/hooks/queries/customerQueryKeys";
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
    Camera,
    Pencil,
    Save,
    X,
    Mail,
    Phone,
    User,
    AlertCircle,
    Loader2,
    ImagePlus,
    Send,
    RefreshCw,
    Timer,
} from "lucide-react";

/* ─── constants ─────────────────────────────────────────────────────── */

const OTP_COUNTDOWN_SECONDS = 120;

/* ─── animation config ──────────────────────────────────────────────── */

const fadeSlide = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" as const } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: "easeIn" as const } },
};

/* ─── helpers ───────────────────────────────────────────────────────── */

const getInitials = (name: string) =>
    name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

const getErrorMessage = (error: unknown): string => {
    if (typeof error === "string") return error;
    if (error && typeof error === "object" && "message" in error) {
        return (error as { message: string }).message;
    }
    return "Invalid input";
};

const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
};

/* ─── types ─────────────────────────────────────────────────────────── */

type EmailChangeStep = "idle" | "newEmail" | "enterOtp";

/* ─── component ─────────────────────────────────────────────────────── */

export function CustomerProfileWorkspace() {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    /* ── core state ────────────────────────────────────────────────── */
    const [isEditing, setIsEditing] = useState(false);
    const [localPhotoPreview, setLocalPhotoPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    /* ── email change state ────────────────────────────────────────── */
    const [emailStep, setEmailStep] = useState<EmailChangeStep>("idle");
    const [newEmail, setNewEmail] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [countdown, setCountdown] = useState(0);

    /* ── countdown timer ───────────────────────────────────────────── */
    useEffect(() => {
        if (countdown <= 0) return;
        const id = setInterval(() => setCountdown((c) => c - 1), 1000);
        return () => clearInterval(id);
    }, [countdown]);

    /* ── query ──────────────────────────────────────────────────────── */
    const { data: profile, isLoading } = useQuery({
        queryKey: customerProfileKeys.me(),
        queryFn: () => getMyProfile(),
    });

    /* ── profile update mutation ────────────────────────────────────── */
    const updateMutation = useMutation({
        mutationFn: (data: FormData) => updateMyProfile(data),
        onSuccess: () => {
            toast.success("Profile updated successfully");
            queryClient.invalidateQueries({ queryKey: customerProfileKeys.me() });
            setIsEditing(false);
            setLocalPhotoPreview(null);
            setSelectedFile(null);
        },
        onError: () => {
            toast.error("Failed to update profile. Please try again.");
        },
    });

    /* ── send OTP mutation ─────────────────────────────────────────── */
    const sendOtpMutation = useMutation({
        mutationFn: (email: string) => sendVerificationOtp(email),
        onSuccess: () => {
            toast.success("Verification code sent to your new email");
            setEmailStep("enterOtp");
            setCountdown(OTP_COUNTDOWN_SECONDS);
            setOtpCode("");
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });

    /* ── verify OTP mutation ───────────────────────────────────────── */
    const verifyOtpMutation = useMutation({
        mutationFn: ({ email, otp }: { email: string; otp: string }) =>
            verifyEmail(email, otp),
        onSuccess: () => {
            toast.success("Email updated successfully!");
            queryClient.invalidateQueries({ queryKey: customerProfileKeys.me() });
            resetEmailFlow();
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
            resetEmailFlow();
        },
    });

    /* ── tanstack form ──────────────────────────────────────────────── */
    const form = useForm({
        defaultValues: {
            name: profile?.name ?? "",
            contactNumber: profile?.contactNumber ?? "",
        },
        onSubmit: async ({ value }) => {
            const dataPayload: Record<string, string> = {};
            let hasChanges = false;

            if (value.name && value.name !== profile?.name) {
                dataPayload.name = value.name;
                hasChanges = true;
            }
            if (value.contactNumber !== (profile?.contactNumber || "")) {
                dataPayload.contactNumber = value.contactNumber;
                hasChanges = true;
            }
            if (selectedFile) {
                hasChanges = true;
            }

            if (!hasChanges) {
                toast.info("No changes to save.");
                setIsEditing(false);
                return;
            }

            const formData = new FormData();
            formData.append("data", JSON.stringify(dataPayload));
            if (selectedFile) {
                formData.append("profilePhoto", selectedFile);
            }

            updateMutation.mutate(formData);
        },
    });

    /* ── handlers ───────────────────────────────────────────────────── */
    const handleEditClick = useCallback(() => {
        if (profile) {
            form.reset();
            form.setFieldValue("name", profile.name || "");
            form.setFieldValue("contactNumber", profile.contactNumber || "");
        }
        setIsEditing(true);
    }, [profile, form]);

    const handleCancelEdit = useCallback(() => {
        setIsEditing(false);
        setLocalPhotoPreview(null);
        setSelectedFile(null);
        resetEmailFlow();
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image must be under 5 MB.");
                return;
            }
            setLocalPhotoPreview(URL.createObjectURL(file));
            setSelectedFile(file);
        }
    };

    const resetEmailFlow = useCallback(() => {
        setEmailStep("idle");
        setNewEmail("");
        setOtpCode("");
        setCountdown(0);
    }, []);

    const handleSendOtp = () => {
        if (!newEmail.trim()) {
            toast.error("Please enter a new email address.");
            return;
        }
        sendOtpMutation.mutate(newEmail.trim());
    };

    const handleVerifyOtp = () => {
        if (!newEmail.trim() || !otpCode.trim()) return;
        verifyOtpMutation.mutate({ email: newEmail.trim(), otp: otpCode.trim() });
    };

    const handleResendOtp = () => {
        if (!newEmail.trim() || countdown > 0) return;
        sendOtpMutation.mutate(newEmail.trim());
    };

    const displayPhoto = localPhotoPreview || profile?.profilePhoto;

    /* ── loading skeleton ───────────────────────────────────────────── */
    if (isLoading) {
        return (
            <div className="mx-auto max-w-3xl space-y-6">
                <Card className="overflow-hidden rounded-xl border">
                    <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
                    <CardContent className="-mt-14 px-6 pb-6">
                        <Skeleton className="size-24 rounded-full ring-4 ring-background" />
                        <div className="mt-4 space-y-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-xl border">
                    <CardContent className="space-y-4 py-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="size-9 rounded-lg" />
                                <div className="space-y-1">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-4 w-44" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    }

    /* ── error / not found ──────────────────────────────────────────── */
    if (!profile) {
        return (
            <div className="mx-auto max-w-3xl">
                <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    <AlertCircle className="size-4 shrink-0" />
                    Customer profile not found or unavailable.
                </div>
            </div>
        );
    }

    /* ── main render ────────────────────────────────────────────────── */
    return (
        <div className="mx-auto max-w-3xl space-y-6">
            {/* ── Header card with banner + avatar ─────────────── */}
            <Card className="overflow-hidden rounded-xl border">
                <div className="relative h-32 bg-gradient-to-br from-primary/30 via-primary/15 to-transparent">
                    <AnimatePresence mode="wait">
                        {!isEditing ? (
                            <motion.div
                                key="view-actions"
                                {...fadeSlide}
                                className="absolute right-4 top-4"
                            >
                                <Button
                                    id="edit-profile-btn"
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5 bg-background/80 backdrop-blur-sm"
                                    onClick={handleEditClick}
                                >
                                    <Pencil className="size-3.5" />
                                    Edit Profile
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="edit-actions"
                                {...fadeSlide}
                                className="absolute right-4 top-4 flex gap-2"
                            >
                                <Button
                                    id="cancel-edit-btn"
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5 bg-background/80 backdrop-blur-sm"
                                    onClick={handleCancelEdit}
                                    disabled={updateMutation.isPending}
                                >
                                    <X className="size-3.5" />
                                    Cancel
                                </Button>
                                <Button
                                    id="save-profile-btn"
                                    size="sm"
                                    className="gap-1.5"
                                    onClick={() => form.handleSubmit()}
                                    disabled={updateMutation.isPending}
                                >
                                    {updateMutation.isPending ? (
                                        <Loader2 className="size-3.5 animate-spin" />
                                    ) : (
                                        <Save className="size-3.5" />
                                    )}
                                    Save
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <CardContent className="-mt-14 px-6 pb-6">
                    {/* Avatar */}
                    <div className="relative inline-block">
                        <Avatar className="size-24 ring-4 ring-background text-xl">
                            {displayPhoto ? (
                                <AvatarImage src={displayPhoto} alt={profile.name} />
                            ) : null}
                            <AvatarFallback className="text-lg font-semibold">
                                {getInitials(profile.name)}
                            </AvatarFallback>
                        </Avatar>

                        {isEditing && (
                            <motion.button
                                type="button"
                                id="upload-photo-btn"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white transition-opacity hover:bg-black/55"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Camera className="size-6" />
                            </motion.button>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                    </div>

                    {/* Name + email beneath avatar */}
                    <div className="mt-3">
                        <h1 className="text-xl font-semibold tracking-tight">
                            {profile.name}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {profile.email}
                        </p>
                    </div>

                    {/* Photo preview badge */}
                    <AnimatePresence>
                        {isEditing && selectedFile && (
                            <motion.div
                                {...fadeSlide}
                                className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"
                            >
                                <ImagePlus className="size-3.5" />
                                <span className="truncate max-w-[200px]">
                                    {selectedFile.name}
                                </span>
                                <button
                                    type="button"
                                    className="text-destructive hover:text-destructive/80 transition-colors"
                                    onClick={() => {
                                        setLocalPhotoPreview(null);
                                        setSelectedFile(null);
                                        if (fileInputRef.current)
                                            fileInputRef.current.value = "";
                                    }}
                                >
                                    <X className="size-3.5" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>

            {/* ── Details card ────────────────────────────────── */}
            <Card className="rounded-xl border">
                <CardHeader className="border-b py-4">
                    <CardTitle className="text-base">Profile Information</CardTitle>
                    <CardDescription>
                        {isEditing
                            ? "Update your profile details below."
                            : "Your personal and account details."}
                    </CardDescription>
                </CardHeader>

                <CardContent className="divide-y py-0">
                    {/* ── Name ──────────────────────────────────── */}
                    <div className="flex items-center gap-4 py-4">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                            <User className="size-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Full Name
                            </p>
                            <AnimatePresence mode="wait">
                                {isEditing ? (
                                    <motion.div key="name-edit" {...fadeSlide}>
                                        <form.Field
                                            name="name"
                                            validators={{
                                                onChange: z.string().min(1, "Name is required"),
                                            }}
                                        >
                                            {(field) => (
                                                <div className="mt-1 space-y-1">
                                                    <Input
                                                        id="profile-name-input"
                                                        value={field.state.value}
                                                        onChange={(e) =>
                                                            field.handleChange(e.target.value)
                                                        }
                                                        onBlur={field.handleBlur}
                                                        placeholder="Your full name"
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
                                        </form.Field>
                                    </motion.div>
                                ) : (
                                    <motion.p
                                        key="name-view"
                                        {...fadeSlide}
                                        className="mt-0.5 text-sm text-foreground"
                                    >
                                        {profile.name}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* ── Email — read-only with change flow ────── */}
                    <div className="flex items-start gap-4 py-4">
                        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                            <Mail className="size-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Email Address
                            </p>

                            <AnimatePresence mode="wait">
                                {emailStep === "idle" && (
                                    <motion.div
                                        key="email-idle"
                                        {...fadeSlide}
                                        className="mt-0.5 flex items-center gap-2"
                                    >
                                        <p className="text-sm text-foreground truncate">
                                            {profile.email}
                                        </p>
                                        {isEditing && (
                                            <Button
                                                id="change-email-btn"
                                                variant="link"
                                                size="sm"
                                                className="h-auto p-0 text-xs text-primary shrink-0"
                                                onClick={() => setEmailStep("newEmail")}
                                            >
                                                Change Email
                                            </Button>
                                        )}
                                    </motion.div>
                                )}

                                {emailStep === "newEmail" && (
                                    <motion.div
                                        key="email-newEmail"
                                        {...fadeSlide}
                                        className="mt-1.5 space-y-2"
                                    >
                                        <Input
                                            id="new-email-input"
                                            type="email"
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                            placeholder="Enter new email address"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleSendOtp();
                                                }
                                            }}
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                id="send-otp-btn"
                                                size="sm"
                                                className="gap-1.5"
                                                onClick={handleSendOtp}
                                                disabled={
                                                    !newEmail.trim() ||
                                                    sendOtpMutation.isPending
                                                }
                                            >
                                                {sendOtpMutation.isPending ? (
                                                    <Loader2 className="size-3.5 animate-spin" />
                                                ) : (
                                                    <Send className="size-3.5" />
                                                )}
                                                Send OTP
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={resetEmailFlow}
                                                disabled={sendOtpMutation.isPending}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                {emailStep === "enterOtp" && (
                                    <motion.div
                                        key="email-enterOtp"
                                        {...fadeSlide}
                                        className="mt-1.5 space-y-2.5"
                                    >
                                        <p className="text-xs text-muted-foreground">
                                            Enter the verification code sent to{" "}
                                            <span className="font-medium text-foreground">
                                                {newEmail}
                                            </span>
                                        </p>

                                        <div className="flex gap-2">
                                            <Input
                                                id="otp-input"
                                                value={otpCode}
                                                onChange={(e) => setOtpCode(e.target.value)}
                                                placeholder="Enter code"
                                                inputMode="numeric"
                                                className="max-w-[160px]"
                                                maxLength={8}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        handleVerifyOtp();
                                                    }
                                                }}
                                            />
                                            <Button
                                                id="verify-otp-btn"
                                                size="sm"
                                                className="gap-1.5 shrink-0"
                                                onClick={handleVerifyOtp}
                                                disabled={
                                                    !otpCode.trim() ||
                                                    verifyOtpMutation.isPending
                                                }
                                            >
                                                {verifyOtpMutation.isPending ? (
                                                    <Loader2 className="size-3.5 animate-spin" />
                                                ) : (
                                                    "Verify"
                                                )}
                                            </Button>
                                        </div>

                                        {/* Timer + resend + cancel */}
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            {countdown > 0 ? (
                                                <>
                                                    <Timer className="size-3.5" />
                                                    <span>
                                                        Resend in{" "}
                                                        {formatCountdown(countdown)}
                                                    </span>
                                                </>
                                            ) : (
                                                <button
                                                    type="button"
                                                    id="resend-otp-btn"
                                                    className="inline-flex items-center gap-1 text-primary hover:underline underline-offset-4 disabled:opacity-50"
                                                    onClick={handleResendOtp}
                                                    disabled={sendOtpMutation.isPending}
                                                >
                                                    <RefreshCw className="size-3" />
                                                    Resend code
                                                </button>
                                            )}

                                            <span className="mx-1">·</span>

                                            <button
                                                type="button"
                                                className="text-muted-foreground hover:text-foreground transition-colors"
                                                onClick={resetEmailFlow}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* ── Contact Number ────────────────────────── */}
                    <div className="flex items-center gap-4 py-4">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                            <Phone className="size-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Contact Number
                            </p>
                            <AnimatePresence mode="wait">
                                {isEditing ? (
                                    <motion.div key="contact-edit" {...fadeSlide}>
                                        <form.Field
                                            name="contactNumber"
                                            validators={{
                                                onChange: z
                                                    .string()
                                                    .min(6, "Contact number is invalid"),
                                            }}
                                        >
                                            {(field) => (
                                                <div className="mt-1 space-y-1">
                                                    <Input
                                                        id="profile-contact-input"
                                                        value={field.state.value}
                                                        onChange={(e) =>
                                                            field.handleChange(e.target.value)
                                                        }
                                                        onBlur={field.handleBlur}
                                                        placeholder="e.g. +8801700000000"
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
                                        </form.Field>
                                    </motion.div>
                                ) : (
                                    <motion.p
                                        key="contact-view"
                                        {...fadeSlide}
                                        className="mt-0.5 text-sm text-foreground"
                                    >
                                        {profile.contactNumber || "—"}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
