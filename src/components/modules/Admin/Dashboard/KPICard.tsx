"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: number;
    suffix?: string;
    prefix?: string;
    description?: string;
}

const KPICard = ({
    title,
    value,
    icon,
    trend,
    suffix,
    prefix,
    description,
}: KPICardProps) => {
    const isPositive = trend ? trend > 0 : false;
    const showTrend = trend !== undefined && trend !== 0;

    return (
        <Card className="group relative overflow-hidden border-border/70 bg-card/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-amber-400/80 via-orange-500/80 to-rose-500/80 opacity-85 transition-opacity group-hover:opacity-100" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                {icon && (
                    <div className="rounded-xl bg-primary/10 p-2 text-primary ring-1 ring-primary/10">
                        {icon}
                    </div>
                )}
            </CardHeader>

            <CardContent>
                <div className="text-3xl font-semibold tracking-tight">
                    {prefix}
                    {value}
                    {suffix}
                </div>

                {showTrend && (
                    <div className="mt-3 flex items-center gap-1">
                        <div
                            className={cn(
                                "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1",
                                isPositive
                                    ? "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20"
                                    : "bg-rose-500/10 text-rose-700 ring-rose-500/20",
                            )}
                        >
                            {isPositive ? (
                                <ArrowUp className="w-3 h-3 mr-0.5" />
                            ) : (
                                <ArrowDown className="w-3 h-3 mr-0.5" />
                            )}
                            {Math.abs(trend)}%
                        </div>
                        {description && (
                            <span className="text-xs text-muted-foreground/90">
                                {description}
                            </span>
                        )}
                    </div>
                )}

                {description && !showTrend && (
                    <p className="mt-3 text-xs text-muted-foreground">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

export default KPICard;
