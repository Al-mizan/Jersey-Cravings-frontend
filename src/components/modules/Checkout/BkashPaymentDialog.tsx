"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useVerifyTrxId } from "@/hooks/useCheckout";
import { bkashTrxIdSchema } from "@/zod/order.validation";

interface BkashPaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderId: string;
    totalAmount: number;
}

export default function BkashPaymentDialog({
    open,
    onOpenChange,
    orderId,
    totalAmount,
}: BkashPaymentDialogProps) {
    const [trxId, setTrxId] = useState("");
    const [error, setError] = useState<string | null>(null);

    const verifyTrxIdMutation = useVerifyTrxId();

    const isPending = verifyTrxIdMutation.isPending;

    const handleConfirm = async () => {
        setError(null);

        const parsed = bkashTrxIdSchema.safeParse({ trxId: trxId.trim() });
        if (!parsed.success) {
            setError(
                parsed.error.issues[0]?.message ?? "Invalid transaction ID",
            );
            return;
        }

        const normalizedTrxId = parsed.data.trxId;

        try {
            await verifyTrxIdMutation.mutateAsync({
                orderId,
                trxId: normalizedTrxId,
            });
            // onOpenChange(false) and navigation are handled in the hook's onSuccess
        } catch {
            // Error toasts are handled by the hook
        }
    };

    const handleClose = () => {
        if (!isPending) {
            setTrxId("");
            setError(null);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center">
                    {/* Bkash Branding */}
                    <div className="mx-auto mb-2 flex items-center justify-center">
                        <div className="flex items-center gap-2 rounded-xl bg-linear-to-r from-pink-500 to-rose-500 px-5 py-2.5">
                            <span className="text-2xl font-bold text-white tracking-tight">
                                bKash
                            </span>
                        </div>
                    </div>
                    <DialogTitle className="text-xl">Pay via Bkash</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Send money to our bKash merchant number and enter the Transaction ID below.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Instructions */}
                    <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
                        <div className="space-y-2 text-sm">
                            <p className="font-medium">Payment Steps:</p>
                            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                                <li>Open your Bkash app</li>
                                <li>
                                    Send Money to{" "}
                                    <span className="font-mono font-bold text-foreground">
                                        01705094855
                                    </span>
                                </li>
                                <li>
                                    Amount:{" "}
                                    <span className="font-bold text-foreground">
                                        ৳{totalAmount.toLocaleString("en-US")}
                                    </span>
                                </li>
                                <li>Copy the Transaction ID and paste below</li>
                            </ol>
                        </div>
                    </div>

                    {/* Placeholder instruction images */}
                    <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="aspect-4/3 rounded-lg bg-linear-to-br from-pink-100 to-rose-100 border border-pink-200/50 flex items-center justify-center"
                            >
                                <span className="text-xs text-pink-400 font-medium">
                                    Step {i}
                                </span>
                            </div>
                        ))}
                    </div>

                    <Separator />

                    {/* TrxID Input */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="bkash-trxid"
                            className={cn(error && "text-destructive")}
                        >
                            Transaction ID (TrxID)
                        </Label>
                        <Input
                            id="bkash-trxid"
                            placeholder="e.g. BK12345678"
                            value={trxId}
                            onChange={(e) => {
                                setTrxId(e.target.value.toUpperCase());
                                if (error) setError(null);
                            }}
                            maxLength={10}
                            disabled={isPending}
                            className={cn(
                                "font-mono text-center text-lg tracking-widest",
                                error &&
                                    "border-destructive focus-visible:ring-destructive/20",
                            )}
                        />
                        <div className="flex justify-between items-center">
                            {error ? (
                                <p className="text-sm text-destructive">
                                    {error}
                                </p>
                            ) : (
                                <p className="text-xs text-muted-foreground">
                                    Must be exactly 10 characters
                                </p>
                            )}
                            <span className="text-xs text-muted-foreground tabular-nums">
                                {trxId.length}/10
                            </span>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col gap-2 sm:flex-col">
                    <Button
                        onClick={handleConfirm}
                        disabled={isPending || trxId.trim().length !== 10}
                        className="w-full bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="size-4 animate-spin mr-2" />
                                Verifying...
                            </>
                        ) : (
                            "Confirm Payment"
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isPending}
                        className="w-full"
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
