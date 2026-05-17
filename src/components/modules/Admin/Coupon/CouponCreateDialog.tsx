"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createCoupon, updateCoupon } from "@/services/coupon.service";
import type { ICoupon, ICreateCouponPayload, IUpdateCouponPayload } from "@/types/commerce.types";

interface CouponCreateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    coupon?: ICoupon | null;
    onSuccess?: () => void;
}

export default function CouponCreateDialog({
    open,
    onOpenChange,
    coupon,
    onSuccess,
}: CouponCreateDialogProps) {
    const queryClient = useQueryClient();
    const isEditing = !!coupon;

    const mutation = useMutation({
        mutationFn: (payload: any) => 
            isEditing 
                ? updateCoupon(coupon.id, payload as IUpdateCouponPayload) 
                : createCoupon(payload as ICreateCouponPayload),
        onSuccess: () => {
            toast.success(`Coupon ${isEditing ? "updated" : "created"} successfully`);
            queryClient.invalidateQueries({ queryKey: ["admin"] });
            onSuccess?.();
            onOpenChange(false);
            form.reset();
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || `Failed to ${isEditing ? "update" : "create"} coupon`;
            toast.error(message);
        },
    });

    const form = useForm({
        defaultValues: {
            code: coupon?.code || "",
            discountType: coupon?.discountType || "PERCENT",
            value: coupon?.value || 0,
            minOrderAmount: coupon?.minOrderAmount || 0,
            maxDiscountAmount: coupon?.maxDiscountAmount || 0,
            isActive: coupon?.isActive ?? true,
            startsAt: coupon?.startsAt ? new Date(coupon.startsAt).toISOString().split('T')[0] : "",
            endsAt: coupon?.endsAt ? new Date(coupon.endsAt).toISOString().split('T')[0] : "",
        },
        onSubmit: async ({ value }) => {
            const payload = { ...value } as any;
            
            if (!payload.startsAt) {
                payload.startsAt = undefined;
            } else {
                payload.startsAt = new Date(payload.startsAt).toISOString();
            }

            if (!payload.endsAt) {
                payload.endsAt = undefined;
            } else {
                payload.endsAt = new Date(payload.endsAt).toISOString();
            }

            mutation.mutate(payload);
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Coupon" : "Create Coupon"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Update coupon details below." : "Fill in the details to create a new discount coupon."}
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
                        name="code"
                        validators={{
                            onChange: ({ value }) => !value ? "Coupon code is required" : undefined,
                        }}
                    >
                        {(field) => (
                            <div>
                                <label className="block text-sm font-medium mb-2">Coupon Code</label>
                                <Input
                                    type="text"
                                    placeholder="e.g., SAVE20"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    disabled={mutation.isPending || isEditing}
                                    className="uppercase"
                                />
                                {field.state.meta.errors && (
                                    <p className="text-xs text-destructive mt-1">{field.state.meta.errors[0]}</p>
                                )}
                            </div>
                        )}
                    </form.Field>

                    <div className="grid grid-cols-2 gap-4">
                        <form.Field name="discountType">
                            {(field) => (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Discount Type</label>
                                    <Select
                                        value={field.state.value}
                                        onValueChange={(value) => field.handleChange(value as "PERCENT" | "FLAT")}
                                        disabled={mutation.isPending}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PERCENT">Percentage (%)</SelectItem>
                                            <SelectItem value="FLAT">Flat Amount (৳)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </form.Field>

                        <form.Field name="value">
                            {(field) => (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Value</label>
                                    <Input
                                        type="number"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(Number(e.target.value))}
                                        disabled={mutation.isPending}
                                    />
                                </div>
                            )}
                        </form.Field>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <form.Field name="minOrderAmount">
                            {(field) => (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Min Order (৳)</label>
                                    <Input
                                        type="number"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(Number(e.target.value))}
                                        disabled={mutation.isPending}
                                    />
                                </div>
                            )}
                        </form.Field>

                        <form.Field name="maxDiscountAmount">
                            {(field) => (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Max Discount (৳)</label>
                                    <Input
                                        type="number"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(Number(e.target.value))}
                                        disabled={mutation.isPending}
                                    />
                                </div>
                            )}
                        </form.Field>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <form.Field name="startsAt">
                            {(field) => (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Starts At</label>
                                    <Input
                                        type="date"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        disabled={mutation.isPending}
                                    />
                                </div>
                            )}
                        </form.Field>

                        <form.Field name="endsAt">
                            {(field) => (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Ends At</label>
                                    <Input
                                        type="date"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        disabled={mutation.isPending}
                                    />
                                </div>
                            )}
                        </form.Field>
                    </div>

                    <form.Field name="isActive">
                        {(field) => (
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="text-sm font-medium">Active Status</p>
                                    <p className="text-xs text-muted-foreground">Enable or disable this coupon</p>
                                </div>
                                <Switch
                                    checked={field.state.value}
                                    onCheckedChange={field.handleChange}
                                    disabled={mutation.isPending}
                                />
                            </div>
                        )}
                    </form.Field>

                    <div className="flex gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={mutation.isPending}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={mutation.isPending}
                            className="flex-1"
                        >
                            {mutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isEditing ? "Update Coupon" : "Create Coupon"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
