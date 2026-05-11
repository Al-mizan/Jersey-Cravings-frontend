"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import CheckoutForm from "@/components/modules/Checkout/CheckoutForm";
import OrderSummary from "@/components/modules/Checkout/OrderSummary";
import { useMyCart } from "@/hooks/useCheckout";

type BillingValues = {
    name: string;
    phone: string;
    address: string;
    email: string;
    orderNote: string;
    city: string;
    area: string;
};

export default function CheckoutPage() {
    const { data: cart, isLoading } = useMyCart();

    const [billingValues, setBillingValues] = useState<BillingValues>({
        name: "",
        phone: "",
        address: "",
        email: "",
        orderNote: "",
        city: "",
        area: "",
    });
    const [isFormValid, setIsFormValid] = useState(false);

    const formRef = useRef<{
        validate: () => Promise<boolean>;
        getValues: () => BillingValues;
    } | null>(null);

    const handleValuesChange = (values: BillingValues, valid: boolean) => {
        setBillingValues(values);
        setIsFormValid(valid);
    };

    const handleValidateForm = async (): Promise<boolean> => {
        if (!formRef.current) return false;
        return formRef.current.validate();
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-10">
                <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-96 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    // Empty cart
    if (!cart || cart.items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-auto max-w-md text-center space-y-6"
                >
                    <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-muted">
                        <ShoppingBag className="size-9 text-muted-foreground" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Your cart is empty
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Add some jerseys to your cart before checking out.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/products">
                            <ArrowLeft className="size-4 mr-2" />
                            Browse Products
                        </Link>
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 lg:py-12">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-3 mb-2">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/products">
                            <ArrowLeft className="size-4 mr-1" />
                            Continue Shopping
                        </Link>
                    </Button>
                </div>
                <h1 className="text-3xl font-bold tracking-tight font-heading">
                    Checkout
                </h1>
                <p className="text-muted-foreground mt-1">
                    Complete your order by filling in the details below
                </p>
            </motion.div>

            {/* Two-Column Layout */}
            <div className="grid gap-8 lg:grid-cols-[1fr_420px] items-start">
                {/* Left Column — Billing Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="shadow-sm">
                        <CardContent className="p-6">
                            <CheckoutForm
                                onValuesChange={handleValuesChange}
                                formRef={formRef}
                            />
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Right Column — Order Summary */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:sticky lg:top-24"
                >
                    <Card className="shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">
                                Order Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 px-6 pb-6">
                            <OrderSummary
                                cart={cart}
                                billingCity={billingValues.city}
                                billingValues={billingValues as unknown as Record<string, unknown>}
                                isFormValid={isFormValid}
                                onValidateForm={handleValidateForm}
                            />
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
