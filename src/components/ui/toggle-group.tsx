"use client";

import * as React from "react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function ToggleGroup({
    className,
    ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
    return (
        <ToggleGroupPrimitive.Root
            data-slot="toggle-group"
            className={cn("flex flex-wrap gap-2", className)}
            {...props}
        />
    );
}

function ToggleGroupItem({
    className,
    ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
    return (
        <ToggleGroupPrimitive.Item
            data-slot="toggle-group-item"
            className={cn(
                "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-input bg-background px-3 text-xs font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-muted data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background disabled:pointer-events-none disabled:opacity-40",
                className,
            )}
            {...props}
        />
    );
}

export { ToggleGroup, ToggleGroupItem };
