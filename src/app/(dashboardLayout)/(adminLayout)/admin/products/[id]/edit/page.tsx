// "use client";

// import React from "react";
// import { useParams, useRouter } from "next/navigation";
// import { useQuery } from "@tanstack/react-query";
// import ProductForm from "@/components/modules/Product/ProductForm";
// import { getProductById } from "@/services/product.service";

// export default function EditProductPage() {
//     const params = useParams<{ id: string }>();
//     const router = useRouter();

//     const { data: product, isLoading } = useQuery({
//         queryKey: ["product", params.id],
//         queryFn: () => getProductById(params.id),
//         staleTime: 30000,
//     });

//     if (isLoading) {
//         return <div className="text-sm text-muted-foreground">Loading...</div>;
//     }

//     if (!product) {
//         return (
//             <div className="text-sm text-muted-foreground">
//                 Product not found
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6">
//             <div>
//                 <h1 className="text-3xl font-bold tracking-tight">
//                     Edit Product
//                 </h1>
//                 <p className="text-muted-foreground mt-1">
//                     Update product details and metadata.
//                 </p>
//             </div>
//             <ProductForm
//                 mode="edit"
//                 initialProduct={product}
//                 onSuccess={(updated) =>
//                     router.push(`/admin/products/${updated.id}`)
//                 }
//             />
//         </div>
//     );
// }

export default function EditProductPage() {
    return <div>Edit Product Page</div>;
}
