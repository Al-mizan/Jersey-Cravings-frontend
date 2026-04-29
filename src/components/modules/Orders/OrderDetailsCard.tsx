import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { IOrder } from "@/types/order.types";

interface OrderDetailsCardProps {
    order: IOrder;
}

const OrderDetailsCard = ({ order }: OrderDetailsCardProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-3">
                    <Badge>{order.status}</Badge>
                    <Badge variant="outline">{order.paymentStatus}</Badge>
                    <Badge variant="outline">{order.paymentMethod}</Badge>
                    <Badge variant="outline">{order.fulfillmentMethod}</Badge>
                </div>
                <p>
                    <span className="font-medium">Order Number:</span>{" "}
                    {order.orderNumber}
                </p>
                <p>
                    <span className="font-medium">Total:</span> ৳
                    {order.totalAmount}
                </p>
                <p>
                    <span className="font-medium">Placed At:</span>{" "}
                    {new Date(order.placedAt).toLocaleString()}
                </p>
                {order.notes && (
                    <p>
                        <span className="font-medium">Notes:</span>{" "}
                        {order.notes}
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

export default OrderDetailsCard;
