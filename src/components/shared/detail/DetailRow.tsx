import React from "react";
import { cn } from "@/lib/utils";

interface DetailRowProps {
    label: string;
    value: React.ReactNode;
    className?: string;
}

export default function DetailRow({ label, value, className }: DetailRowProps) {
    return (
        <div className={cn("flex justify-between text-sm", className)}>
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}
