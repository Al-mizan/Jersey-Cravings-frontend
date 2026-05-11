"use client";

import React from "react";
import { Check, Circle, Package, Truck, PackageCheck, XCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type OrderStatus =
    | "PENDING_PAYMENT"
    | "PAID"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED"
    | "EXPIRED";

const FLOW_STEPS = [
    { status: "PROCESSING", label: "Processing", icon: Package },
    { status: "SHIPPED", label: "Shipped", icon: Truck },
    { status: "DELIVERED", label: "Delivered", icon: PackageCheck },
] as const;

const STATUS_ORDER: Record<string, number> = {
    PENDING_PAYMENT: -1,
    PAID: 0,
    PROCESSING: 0,
    SHIPPED: 1,
    DELIVERED: 2,
};

interface OrderStatusStepperProps {
    status: OrderStatus;
}

export default function OrderStatusStepper({ status }: OrderStatusStepperProps) {
    const isCancelled = status === "CANCELLED";
    const isRefunded = status === "REFUNDED";
    const isExpired = status === "EXPIRED";
    const isTerminal = isCancelled || isRefunded || isExpired;

    if (isTerminal) {
        return (
            <div className="flex flex-col items-center gap-3 py-6">
                <div
                    className={cn(
                        "flex size-16 items-center justify-center rounded-full",
                        isCancelled && "bg-red-100",
                        isRefunded && "bg-zinc-100",
                        isExpired && "bg-zinc-100",
                    )}
                >
                    {isCancelled && <XCircle className="size-8 text-red-500" />}
                    {isRefunded && <RotateCcw className="size-8 text-zinc-500" />}
                    {isExpired && <XCircle className="size-8 text-zinc-500" />}
                </div>
                <Badge
                    variant={isCancelled ? "destructive" : "outline"}
                    className="text-sm px-4 py-1"
                >
                    {status.replace(/_/g, " ")}
                </Badge>
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                    {isCancelled && "This order has been cancelled."}
                    {isRefunded && "This order has been refunded."}
                    {isExpired && "This order has expired."}
                </p>
            </div>
        );
    }

    const currentIndex = STATUS_ORDER[status] ?? -1;

    return (
        <div className="w-full py-6">
            {/* Desktop: Horizontal */}
            <div className="hidden sm:flex items-center justify-between relative">
                {FLOW_STEPS.map((step, i) => {
                    const isCompleted = currentIndex > i;
                    const isActive = currentIndex === i;
                    const isPending = currentIndex < i;
                    const StepIcon = step.icon;

                    return (
                        <React.Fragment key={step.status}>
                            {/* Connector line (before each step except first) */}
                            {i > 0 && (
                                <div className="flex-1 mx-2">
                                    <div
                                        className={cn(
                                            "h-1 rounded-full transition-colors duration-500",
                                            isCompleted || isActive
                                                ? "bg-emerald-500"
                                                : "bg-muted",
                                        )}
                                    />
                                </div>
                            )}

                            {/* Step Node */}
                            <div className="flex flex-col items-center gap-2 relative z-10">
                                <div
                                    className={cn(
                                        "flex size-12 items-center justify-center rounded-full border-2 transition-all duration-300",
                                        isCompleted &&
                                            "border-emerald-500 bg-emerald-500 text-white",
                                        isActive &&
                                            "border-emerald-500 bg-emerald-50 text-emerald-600 ring-4 ring-emerald-100",
                                        isPending &&
                                            "border-muted bg-muted text-muted-foreground",
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="size-5" />
                                    ) : (
                                        <StepIcon className="size-5" />
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        "text-xs font-medium text-center",
                                        isCompleted && "text-emerald-600",
                                        isActive && "text-emerald-600 font-bold",
                                        isPending && "text-muted-foreground",
                                    )}
                                >
                                    {step.label}
                                </span>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Mobile: Vertical */}
            <div className="flex flex-col gap-0 sm:hidden">
                {FLOW_STEPS.map((step, i) => {
                    const isCompleted = currentIndex > i;
                    const isActive = currentIndex === i;
                    const isPending = currentIndex < i;
                    const StepIcon = step.icon;
                    const isLast = i === FLOW_STEPS.length - 1;

                    return (
                        <div key={step.status} className="flex gap-4">
                            {/* Vertical connector + circle */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={cn(
                                        "flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                                        isCompleted &&
                                            "border-emerald-500 bg-emerald-500 text-white",
                                        isActive &&
                                            "border-emerald-500 bg-emerald-50 text-emerald-600 ring-4 ring-emerald-100",
                                        isPending &&
                                            "border-muted bg-muted text-muted-foreground",
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="size-4" />
                                    ) : (
                                        <StepIcon className="size-4" />
                                    )}
                                </div>
                                {!isLast && (
                                    <div
                                        className={cn(
                                            "w-0.5 flex-1 min-h-8 transition-colors",
                                            isCompleted
                                                ? "bg-emerald-500"
                                                : "bg-muted",
                                        )}
                                    />
                                )}
                            </div>
                            {/* Label */}
                            <div className="pb-6">
                                <p
                                    className={cn(
                                        "text-sm font-medium pt-2",
                                        isCompleted && "text-emerald-600",
                                        isActive && "text-emerald-600 font-bold",
                                        isPending && "text-muted-foreground",
                                    )}
                                >
                                    {step.label}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
