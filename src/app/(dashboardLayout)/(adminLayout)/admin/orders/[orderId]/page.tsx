// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import OrderDetailsCard from "@/components/modules/Orders/OrderDetailsCard";
// import { getOrderById } from "@/services/order.service";

// interface AdminOrderDetailsPageProps {
//     params: Promise<{ orderId: string }>;
// }

// export default async function AdminOrderDetailsPage({
//     params,
// }: AdminOrderDetailsPageProps) {
//     const { orderId } = await params;
//     const order = await getOrderById(orderId);

//     if (!order) {
//         return (
//             <div className="space-y-4">
//                 <h1 className="text-2xl font-semibold">Order not found</h1>
//                 <Button asChild variant="outline">
//                     <Link href="/admin/orders">Back to orders</Link>
//                 </Button>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6">
//             <div className="flex items-center justify-between">
//                 <div>
//                     <h1 className="text-3xl font-bold tracking-tight">
//                         Order {order.orderNumber}
//                     </h1>
//                     <p className="text-muted-foreground mt-1">
//                         Status: {order.status}
//                     </p>
//                 </div>
//                 <Button asChild variant="outline">
//                     <Link href="/admin/orders">Back to orders</Link>
//                 </Button>
//             </div>
//             <OrderDetailsCard order={order} />
//         </div>
//     );
// }


export default function OrderDetailsPage() {
    return (
        <div>
            Order Details Page
        </div>
    )
}