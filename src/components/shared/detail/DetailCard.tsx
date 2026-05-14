import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DetailCardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

export default function DetailCard({ title, children, className }: DetailCardProps) {
    return (
        <Card className={className}>
            <CardHeader className="pb-4">
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-6 pb-6">
                {children}
            </CardContent>
        </Card>
    );
}
