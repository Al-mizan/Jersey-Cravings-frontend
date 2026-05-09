"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminById, updateAdminById } from "@/services/admin.service";
import { adminProfileKeys } from "@/hooks/queries/adminQueryKeys";
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
    Shield,
    User,
    AlertCircle,
    Loader2,
} from "lucide-react";
import ProfileField from "./ProfileField";

interface MyProfileWorkspaceProps {
    adminId: string;
}

export function MyProfileWorkspace({ adminId }: MyProfileWorkspaceProps) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        contactNumber: "",
    });
    const [localPhotoPreview, setLocalPhotoPreview] = useState<string | null>(
        null,
    );
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const {
        data: admin,
        isLoading,
    } = useQuery({
        queryKey: adminProfileKeys.detail(adminId),
        queryFn: () => getAdminById(adminId),
    });

    const updateMutation = useMutation({
        mutationFn: (data: FormData) => updateAdminById(adminId, data),
        onSuccess: () => {
            toast.success("Profile updated successfully");
            queryClient.invalidateQueries({
                queryKey: adminProfileKeys.detail(adminId),
            });
            setIsEditing(false);
            setLocalPhotoPreview(null);
            setSelectedFile(null);
        },
        onError: () => {
            toast.error("Failed to update profile. Please try again.");
        },
    });

    const handleEditClick = () => {
        if (admin) {
            setFormData({
                name: admin.name || "",
                contactNumber: admin.contactNumber || "",
            });
        }
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setLocalPhotoPreview(null);
        setSelectedFile(null);
    };

    const handleSave = () => {
        const payload = new FormData();
        let hasChanges = false;

        if (formData.name && formData.name !== admin?.name) {
            payload.append("name", formData.name);
            hasChanges = true;
        }
        if (formData.contactNumber !== (admin?.contactNumber || "")) {
            payload.append("contactNumber", formData.contactNumber);
            hasChanges = true;
        }
        if (selectedFile) {
            payload.append("profilePhoto", selectedFile);
            hasChanges = true;
        }

        if (!hasChanges) {
            toast.info("No changes to save.");
            setIsEditing(false);
            return;
        }
        updateMutation.mutate(payload);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setLocalPhotoPreview(previewUrl);
            setSelectedFile(file);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const displayPhoto =
        localPhotoPreview || admin?.profilePhoto;

    // ── Loading skeleton ──────────────────────────────────────────────
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
                        {Array.from({ length: 4 }).map((_, i) => (
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

    // ── Error / not found ─────────────────────────────────────────────
    if (!admin) {
        return (
            <div className="mx-auto max-w-3xl">
                <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    <AlertCircle className="size-4 shrink-0" />
                    Admin profile not found or unavailable.
                </div>
            </div>
        );
    }

    const role = admin.user?.role ?? "ADMIN";
    const roleBadgeColor =
        role === "SUPER_ADMIN"
            ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
            : "border-primary/30 bg-primary/10 text-primary";

    // ── Main render ───────────────────────────────────────────────────
    return (
        <div className="mx-auto max-w-3xl space-y-6">
            {/* ── Header card with banner + avatar ─────────────── */}
            <Card className="overflow-hidden rounded-xl border">
                {/* Gradient banner */}
                <div className="relative h-32 bg-gradient-to-br from-primary/30 via-primary/15 to-transparent">
                    {/* Edit button */}
                    {!isEditing && (
                        <Button
                            id="edit-profile-btn"
                            variant="outline"
                            size="sm"
                            className="absolute right-4 top-4 gap-1.5 bg-background/80 backdrop-blur-sm"
                            onClick={handleEditClick}
                        >
                            <Pencil className="size-3.5" />
                            Edit Profile
                        </Button>
                    )}
                    {isEditing && (
                        <div className="absolute right-4 top-4 flex gap-2">
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
                                onClick={handleSave}
                                disabled={updateMutation.isPending}
                            >
                                {updateMutation.isPending ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                    <Save className="size-3.5" />
                                )}
                                Save
                            </Button>
                        </div>
                    )}
                </div>

                <CardContent className="-mt-14 px-6 pb-6">
                    {/* Avatar area */}
                    <div className="relative inline-block">
                        <Avatar className="size-24 ring-4 ring-background text-xl">
                            {displayPhoto ? (
                                <AvatarImage
                                    src={displayPhoto}
                                    alt={admin.name}
                                />
                            ) : null}
                            <AvatarFallback className="text-lg font-semibold">
                                {getInitials(admin.name)}
                            </AvatarFallback>
                        </Avatar>

                        {/* Camera overlay in edit mode */}
                        {isEditing && (
                            <button
                                type="button"
                                id="upload-photo-btn"
                                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white transition-opacity hover:bg-black/55"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Camera className="size-6" />
                            </button>
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
                            {admin.name}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {admin.email}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* ── Details card ────────────────────────────────── */}
            <Card className="rounded-xl border">
                <CardHeader className="border-b py-4">
                    <CardTitle className="text-base">
                        Profile Information
                    </CardTitle>
                    <CardDescription>
                        {isEditing
                            ? "Update your profile details below."
                            : "Your personal and account details."}
                    </CardDescription>
                </CardHeader>

                <CardContent className="divide-y py-0">
                    {/* Name */}
                    <ProfileField
                        icon={<User className="size-4" />}
                        label="Full Name"
                        isEditing={isEditing}
                        value={admin.name}
                        editValue={formData.name}
                        onChange={(v) =>
                            setFormData((prev) => ({ ...prev, name: v }))
                        }
                        inputId="profile-name-input"
                    />

                    {/* Email — always read-only */}
                    <ProfileField
                        icon={<Mail className="size-4" />}
                        label="Email Address"
                        isEditing={false}
                        value={admin.email}
                    />

                    {/* Contact Number */}
                    <ProfileField
                        icon={<Phone className="size-4" />}
                        label="Contact Number"
                        isEditing={isEditing}
                        value={admin.contactNumber || "—"}
                        editValue={formData.contactNumber}
                        onChange={(v) =>
                            setFormData((prev) => ({
                                ...prev,
                                contactNumber: v,
                            }))
                        }
                        placeholder="e.g. 01700000000"
                        inputId="profile-contact-input"
                    />



                    {/* Role — never editable */}
                    <div className="flex items-center gap-4 py-4">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                            <Shield className="size-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Role
                            </p>
                            <div className="mt-0.5">
                                <span
                                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${roleBadgeColor}`}
                                >
                                    {role.replace("_", " ")}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}