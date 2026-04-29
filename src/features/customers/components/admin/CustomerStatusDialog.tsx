"use client";

import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useChangeCustomerStatus } from "@/features/customers/hooks";
import { UserStatus } from "@/types/auth.types";
import { changeCustomerStatusZodSchema } from "@/zod/customer.validation";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";

interface CustomerStatusDialogProps {
    customerId: string;
    currentStatus: UserStatus;
    isOpen: boolean;
    onOpenChange: (nextOpen: boolean) => void;
}

export const CustomerStatusDialog = ({
    customerId,
    currentStatus,
    isOpen,
    onOpenChange,
}: CustomerStatusDialogProps) => {
    const [serverError, setServerError] = useState<string | null>(null);
    const { mutateAsync, isPending } = useChangeCustomerStatus();

    const form = useForm({
        defaultValues: {
            status: currentStatus,
        },
        onSubmit: async ({ value }) => {
            setServerError(null);

            const payload = {
                customerId,
                status: value.status,
            };

            const validationResult = changeCustomerStatusZodSchema.safeParse(payload);

            if (!validationResult.success) {
                setServerError(
                    validationResult.error.issues[0]?.message ?? "Validation failed",
                );
                return;
            }

            try {
                await mutateAsync(validationResult.data);
                toast.success("Customer status updated");
                onOpenChange(false);
            } catch (error) {
                setServerError(
                    error instanceof Error ? error.message : "Failed to update status",
                );
            }
        },
    });

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Change Customer Status</DialogTitle>
                    <DialogDescription>
                        Apply lifecycle status changes for this customer account.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-4"
                    noValidate
                    onSubmit={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        form.handleSubmit();
                    }}
                >
                    <form.Field name="status">
                        {(field) => (
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Status</p>
                                <Select
                                    value={field.state.value}
                                    onValueChange={(value) =>
                                        field.handleChange(value as UserStatus)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                                        <SelectItem value="BLOCKED">BLOCKED</SelectItem>
                                        <SelectItem value="DELETED">DELETED</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </form.Field>

                    {serverError && (
                        <Alert variant="destructive">
                            <AlertDescription>{serverError}</AlertDescription>
                        </Alert>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>

                        <form.Subscribe
                            selector={(state) => [state.canSubmit, state.isSubmitting] as const}
                        >
                            {([canSubmit, isSubmitting]) => (
                                <AppSubmitButton
                                    isPending={isSubmitting || isPending}
                                    pendingLabel="Updating..."
                                    disabled={!canSubmit}
                                >
                                    Save Status
                                </AppSubmitButton>
                            )}
                        </form.Subscribe>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
