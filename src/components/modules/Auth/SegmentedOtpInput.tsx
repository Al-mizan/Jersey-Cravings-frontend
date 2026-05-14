"use client";

import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";

interface SegmentedOtpInputProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function SegmentedOtpInput({
    value,
    onChange,
    disabled = false,
}: SegmentedOtpInputProps) {
    return (
        <InputOTP
            maxLength={6}
            value={value}
            onChange={onChange}
            disabled={disabled}
            containerClassName="justify-center"
        >
            <InputOTPGroup className="gap-1 sm:gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <InputOTPSlot
                        key={i}
                        index={i}
                        className="size-10 sm:size-12 rounded-md border border-input bg-background text-sm font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    />
                ))}
            </InputOTPGroup>
        </InputOTP>
    );
}
