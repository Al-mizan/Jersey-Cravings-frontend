"use client";

import { MapPin, Phone, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const PICKUP_LOCATION = {
    name: "Jahangirnagar University",
    addressLine:
        "Jahangirnagar University Campus, Savar, Dhaka-1342, Bangladesh",
    city: "Savar",
    district: "Dhaka",
    phone: "01705094855",
    // openingHours: "10:00 AM – 6:00 PM (Sat–Thu)",
};

export default function AdminFulfillmentPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Fulfillment
                </h1>
                <p className="text-muted-foreground mt-1">
                    Pickup location for customer orders.
                </p>
            </div>

            {/* Pickup Location Card */}
            <Card className="max-w-2xl">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <MapPin className="size-5 text-primary" />
                            Pickup Location
                        </CardTitle>
                        <Badge
                            variant="outline"
                            className="border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                        >
                            <CheckCircle2 className="size-3 mr-1" />
                            Active
                        </Badge>
                    </div>
                </CardHeader>

                <Separator />

                <CardContent className="pt-5 space-y-4">
                    {/* Name */}
                    <div>
                        <p className="text-sm font-medium text-muted-foreground mb-0.5">
                            Location Name
                        </p>
                        <p className="text-base font-semibold">
                            {PICKUP_LOCATION.name}
                        </p>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-2">
                        <MapPin className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-0.5">
                                Address
                            </p>
                            <p className="text-sm">
                                {PICKUP_LOCATION.addressLine}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {PICKUP_LOCATION.city},{" "}
                                {PICKUP_LOCATION.district}
                            </p>
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-2">
                        <Phone className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-0.5">
                                Contact
                            </p>
                            <p className="text-sm">{PICKUP_LOCATION.phone}</p>
                        </div>
                    </div>

                    {/* Opening Hours */}
                    {/* <div className="flex items-start gap-2">
                        <Clock className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-0.5">
                                Opening Hours
                            </p>
                            <p className="text-sm">
                                {PICKUP_LOCATION.openingHours}
                            </p>
                        </div>
                    </div> */}

                    <Separator />

                    <p className="text-xs text-muted-foreground italic">
                        This is the only pickup point. Customers selecting
                        &quot;Delivery Inside Jahangirnagar University&quot;
                        will automatically use this location.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}