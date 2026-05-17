"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createAdmin } from "@/services/admin.service";
import type { ICreateAdminPayload } from "@/types/admin.types";

interface AdminCreateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function AdminCreateDialog({
    open,
    onOpenChange,
    onSuccess,
}: AdminCreateDialogProps) {
    const createMutation = useMutation({
        mutationFn: (payload: ICreateAdminPayload) => createAdmin(payload),
        onSuccess: () => {
            onSuccess?.();
            form.reset();
        },
        onError: (error: any) => {
            const message =
                error?.response?.data?.message || "Failed to create admin";
            toast.error(message);
        },
    });

    const form = useForm({
        defaultValues: {
            password: "",
            admin: {
                name: "",
                identifier: "",
                contactNumber: "",
                profilePhoto: "",
            },
        },
        onSubmit: async ({ value }) => {
            const finalValue = { ...value, role: "ADMIN" as const };
            if (!finalValue.admin.contactNumber) {
                delete (finalValue.admin as any).contactNumber;
            }
            createMutation.mutate(finalValue as ICreateAdminPayload);
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Create Admin</DialogTitle>
                    <DialogDescription>
                        Add a new admin user to your system. Super Admin only.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                    className="space-y-4"
                >
                    <form.Field
                        name="admin.name"
                        validators={{
                            onChange: ({ value }) =>
                                !value ? "Name is required" : undefined,
                        }}
                    >
                        {(field) => (
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Full Name
                                </label>
                                <Input
                                    type="text"
                                    placeholder="e.g., John Doe"
                                    value={field.state.value}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    disabled={createMutation.isPending}
                                />
                                {field.state.meta.errors && (
                                    <p className="text-xs text-destructive mt-1">
                                        {field.state.meta.errors[0]}
                                    </p>
                                )}
                            </div>
                        )}
                    </form.Field>

                    <form.Field
                        name="admin.identifier"
                        validators={{
                            onChange: ({ value }) =>
                                !value ? "Identifier is required" : undefined,
                        }}
                    >
                        {(field) => (
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Identifier (Email)
                                </label>
                                <Input
                                    type="email"
                                    placeholder="e.g., [email@example.com]"
                                    value={field.state.value}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    disabled={createMutation.isPending}
                                />
                                {field.state.meta.errors && (
                                    <p className="text-xs text-destructive mt-1">
                                        {field.state.meta.errors[0]}
                                    </p>
                                )}
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="admin.contactNumber">
                        {(field) => (
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Contact Number
                                </label>
                                <Input
                                    type="tel"
                                    placeholder="+880 1XXXXXXXXX"
                                    value={field.state.value}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    disabled={createMutation.isPending}
                                />
                                {field.state.meta.errors && (
                                    <p className="text-xs text-destructive mt-1">
                                        {field.state.meta.errors[0]}
                                    </p>
                                )}
                            </div>
                        )}
                    </form.Field>

                    <form.Field
                        name="password"
                        validators={{
                            onChange: ({ value }) =>
                                !value
                                    ? "Password is required"
                                    : value.length < 6
                                      ? "Password must be at least 6 characters"
                                      : undefined,
                        }}
                    >
                        {(field) => (
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Password
                                </label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={field.state.value}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    disabled={createMutation.isPending}
                                />
                                {field.state.meta.errors && (
                                    <p className="text-xs text-destructive mt-1">
                                        {field.state.meta.errors[0]}
                                    </p>
                                )}
                            </div>
                        )}
                    </form.Field>



                    <div className="flex gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={createMutation.isPending}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="flex-1"
                        >
                            {createMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Create Admin
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
