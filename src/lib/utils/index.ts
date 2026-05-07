import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Converts a string to a URL-safe slug format
 * @param value - The string to convert
 * @returns The slugified string
 */
export function slugify(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}

export function getIconComponent(iconName: string): LucideIcon {
    const IconComponent =
        Icons[iconName as keyof typeof Icons] as unknown as LucideIcon;

    return IconComponent ?? Icons.HelpCircle;
}

