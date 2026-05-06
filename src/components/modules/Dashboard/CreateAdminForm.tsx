"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createAdminZodSchema } from "@/zod/admin.validation";
import { adminApiClient } from "@/lib/axios/adminApiClient";
import type { IAdmin } from "@/types/admin.types";

interface CreateAdminFormProps {
    admin?: IAdmin;
    onSuccess: () => void;
    onCancel: () => void;
}

const CreateAdminForm = ({
    admin,
    onSuccess,
    onCancel,
}: CreateAdminFormProps) => {
    const [serverError, setServerError] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<"ADMIN" | "SUPER_ADMIN">(
        (admin?.user?.role as "ADMIN" | "SUPER_ADMIN") || "ADMIN",
    );

    const { mutateAsync, isPending } = useMutation({
        mutationFn: async (payload: unknown) => {
            if (admin) {
                return await adminApiClient.updateAdmin(
                    admin.id,
                    payload as any,
                );
            } else {
                return await adminApiClient.createAdmin(payload as any);
            }
        },
    });

    const form = useForm({
        defaultValues: {
            password: "",
            role: selectedRole,
            admin: {
                name: admin?.name || "",
                email: admin?.email || "",
                contactNumber: admin?.contactNumber || "",
                profilePhoto: admin?.profilePhoto || "",
            },
        },

        onSubmit: async ({ value }) => {
            setServerError(null);
            try {
                // For updates, don't include password
                const payload = admin
                    ? {
                          name: value.admin.name,
                          contactNumber: value.admin.contactNumber,
                          profilePhoto: value.admin.profilePhoto,
                      }
                    : {
                          password: value.password,
                          role: value.role,
                          admin: {
                              name: value.admin.name,
                              email: value.admin.email,
                              contactNumber: value.admin.contactNumber,
                              profilePhoto: value.admin.profilePhoto,
                          },
                      };

                await mutateAsync(payload);
                onSuccess();
            } catch (error: any) {
                const message =
                    error?.response?.data?.message ||
                    error?.message ||
                    "An error occurred";
                setServerError(message);
            }
        },
    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
            }}
            className="space-y-4"
            noValidate
        >
            {serverError && (
                <Alert variant="destructive">
                    <AlertDescription>{serverError}</AlertDescription>
                </Alert>
            )}

            {/* Name Field */}
            <form.Field
                name="admin.name"
                validators={{
                    onChange: createAdminZodSchema.shape.admin.shape.name,
                }}
            >
                {(field) => (
                    <AppField
                        field={field}
                        label="Full Name"
                        type="text"
                        placeholder="Enter admin name"
                    />
                )}
            </form.Field>

            {/* Email Field (disabled for edit) */}
            {!admin && (
                <form.Field
                    name="admin.email"
                    validators={{
                        onChange: createAdminZodSchema.shape.admin.shape.email,
                    }}
                >
                    {(field) => (
                        <AppField
                            field={field}
                            label="Email"
                            type="email"
                            placeholder="Enter admin email"
                        />
                    )}
                </form.Field>
            )}

            {/* Password Field (hidden for edit) */}
            {!admin && (
                <form.Field
                    name="password"
                    validators={{
                        onChange: createAdminZodSchema.shape.password,
                    }}
                >
                    {(field) => (
                        <AppField
                            field={field}
                            label="Password"
                            type="password"
                            placeholder="Enter a strong password"
                        />
                    )}
                </form.Field>
            )}

            {/* Role Field (hidden for edit) */}
            {!admin && (
                <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <Select
                        value={selectedRole}
                        onValueChange={(value: any) => {
                            setSelectedRole(value);
                            form.setFieldValue("role", value);
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="SUPER_ADMIN">
                                Super Admin
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Contact Number Field */}
            <form.Field
                name="admin.contactNumber"
                validators={{
                    onChange:
                        createAdminZodSchema.shape.admin.shape.contactNumber,
                }}
            >
                {(field) => (
                    <AppField
                        field={field}
                        label="Contact Number (Optional)"
                        type="text"
                        placeholder="01xxxxxxxxx"
                    />
                )}
            </form.Field>

            {/* Profile Photo URL Field
            <form.Field
                name="admin.profilePhoto"
                validators={{
                    onChange:
                        createAdminZodSchema.shape.admin.shape.profilePhoto,
                }}
            >
                {(field) => (
                    <AppField
                        field={field}
                        label="Profile Photo URL (Optional)"
                        type="text"
                        placeholder="https://example.com/photo.jpg"
                    />
                )}
            </form.Field> */}

            {/* Form Actions */}
            <div className="flex gap-2 pt-4">
                <form.Subscribe
                    selector={(s) => [s.canSubmit, s.isSubmitting] as const}
                >
                    {([canSubmit, isSubmitting]) => (
                        <>
                            <AppSubmitButton
                                isPending={isSubmitting || isPending}
                                pendingLabel={
                                    admin ? "Updating..." : "Creating..."
                                }
                                disabled={!canSubmit}
                            >
                                {admin ? "Update Admin" : "Create Admin"}
                            </AppSubmitButton>
                        </>
                    )}
                </form.Subscribe>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isPending}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
};

export default CreateAdminForm;
