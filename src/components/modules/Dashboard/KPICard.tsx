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
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                {icon && <div className="text-muted-foreground">{icon}</div>}
            </CardHeader>

            <CardContent>
                <div className="text-2xl font-bold">
                    {prefix}
                    {value}
                    {suffix}
                </div>

                {showTrend && (
                    <div className="flex items-center gap-1 mt-2">
                        <div
                            className={cn(
                                "flex items-center text-xs font-medium",
                                isPositive ? "text-green-600" : "text-red-600",
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
                            <span className="text-xs text-muted-foreground">
                                {description}
                            </span>
                        )}
                    </div>
                )}

                {description && !showTrend && (
                    <p className="text-xs text-muted-foreground mt-2">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

export default KPICard;
