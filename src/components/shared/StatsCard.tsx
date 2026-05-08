import { getIconComponent } from "@/lib/iconMapper";
import { cn } from "@/lib/utils";
import { createElement } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface StatsCardProps {
    title: string;
    value: string | number;
    iconName: string;
    description?: string;
    className?: string;
}

const StatsCard = ({
    title,
    value,
    iconName,
    description,
    className,
}: StatsCardProps) => {
    return (
        <Card
            className={cn(
                "group relative overflow-hidden border-border/70 bg-card/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                className,
            )}
        >
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary/70 via-primary to-primary/70 opacity-80 transition-opacity group-hover:opacity-100" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                    {createElement(getIconComponent(iconName), {
                        className: "h-5 w-5",
                    })}
                </div>
            </CardHeader>

            <CardContent className="space-y-1">
                <div className="text-3xl font-semibold tracking-tight">{value}</div>
                {description && (
                    <p className="text-xs font-medium text-muted-foreground/90">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

export default StatsCard;
