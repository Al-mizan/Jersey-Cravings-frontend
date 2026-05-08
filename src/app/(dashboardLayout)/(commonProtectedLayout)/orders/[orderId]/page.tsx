// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import OrderDetailsCard from "@/components/modules/Orders/OrderDetailsCard";
// import { getMyOrderById } from "@/services/order.service";

// interface MyOrderDetailsPageProps {
//     params: Promise<{ orderId: string }>;
// }

// export default async function MyOrderDetailsPage({
//     params,
// }: MyOrderDetailsPageProps) {
//     const { orderId } = await params;
//     const order = await getMyOrderById(orderId);

//     if (!order) {
//         return (
//             <div className="space-y-4">
//                 <h1 className="text-2xl font-semibold">Order not found</h1>
//                 <Button asChild variant="outline">
//                     <Link href="/orders">Back to orders</Link>
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
//                     <Link href="/orders">Back to orders</Link>
//                 </Button>
//             </div>
//             <OrderDetailsCard order={order} />
//         </div>
//     );
// }

export default function MyOrderDetailsPage() {
    return <div>My Order Details Page</div>;
}
