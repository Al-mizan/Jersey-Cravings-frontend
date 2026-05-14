"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface IdentifierFieldProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    error?: string;
    disabled?: boolean;
    label?: string;
    toggleLabel?: string;
}

export function IdentifierField({
    value,
    onChange,
    onBlur,
    error,
    disabled = false,
    label = "Email or Phone",
    toggleLabel = "Use phone instead",
}: IdentifierFieldProps) {
    const [isPhone, setIsPhone] = useState(false);

    const isEmail = (str: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(str);

    const displayLabel = isPhone ? "Phone Number" : "Email Address";
    const nextToggleLabel = isPhone
        ? "Sign in with email"
        : "Sign in with phone number";

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground tracking-wide">
                    {displayLabel}
                </Label>
                <button
                    type="button"
                    onClick={() => {
                        setIsPhone(!isPhone);
                        onChange("");
                    }}
                    className="text-xs text-primary underline underline-offset-2"
                >
                    {nextToggleLabel}
                </button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={isPhone ? "phone" : "email"}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.2 }}
                >
                    <Input
                        type={isPhone ? "tel" : "email"}
                        placeholder={
                            isPhone
                                ? "01123456789"
                                : "you@example.com"
                        }
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onBlur}
                        disabled={disabled}
                        className="h-11 bg-background/50 border-border/60 focus-visible:ring-primary/30"
                        inputMode={isPhone ? "tel" : "email"}
                    />
                </motion.div>
            </AnimatePresence>

            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}
