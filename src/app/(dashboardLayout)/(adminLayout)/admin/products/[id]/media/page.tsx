// "use client";

// import React from "react";
// import { useParams } from "next/navigation";
// import { useQuery } from "@tanstack/react-query";
// import MediaManager from "@/components/modules/Product/MediaManager";
// import { getProductMedia } from "@/services/product.service";

// export default function ProductMediaPage() {
//     const params = useParams<{ id: string }>();

//     const { data, isLoading, refetch } = useQuery({
//         queryKey: ["product-media", params.id],
//         queryFn: () => getProductMedia(params.id),
//         staleTime: 30000,
//     });

//     return (
//         <div className="space-y-6">
//             <div>
//                 <h1 className="text-3xl font-bold tracking-tight">
//                     Product Media
//                 </h1>
//                 <p className="text-muted-foreground mt-1">
//                     Upload and manage product images.
//                 </p>
//             </div>

//             <MediaManager
//                 productId={params.id}
//                 media={data?.data || null}
//                 isLoading={isLoading}
//                 onRefresh={refetch}
//             />
//         </div>
//     );
// }

export default function ProductMediaPage() {
    return <div>Product Media Page</div>;
}
