// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { getProductById } from "@/services/product.service";

// interface ProductDetailsPageProps {
//     params: Promise<{ id: string }>;
// }

// export default async function ProductDetailsPage({
//     params,
// }: ProductDetailsPageProps) {
//     const { id } = await params;
//     const product = await getProductById(id);

//     if (!product) {
//         return (
//             <div className="space-y-4">
//                 <h1 className="text-2xl font-semibold">Product not found</h1>
//                 <Button asChild variant="outline">
//                     <Link href="/admin/products">Back to products</Link>
//                 </Button>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6">
//             <div className="flex items-center justify-between">
//                 <div>
//                     <h1 className="text-3xl font-bold tracking-tight">
//                         {product.title}
//                     </h1>
//                     <p className="text-muted-foreground mt-1">
//                         {product.teamName} • {product.jerseyType}
//                     </p>
//                 </div>
//                 <div className="flex gap-2">
//                     <Button asChild variant="outline">
//                         <Link href={`/admin/products/${product.id}/edit`}>
//                             Edit Product
//                         </Link>
//                     </Button>
//                     <Button asChild variant="outline">
//                         <Link href={`/admin/products/${product.id}/variants`}>
//                             Manage Variants
//                         </Link>
//                     </Button>
//                     <Button asChild variant="outline">
//                         <Link href={`/admin/products/${product.id}/media`}>
//                             Manage Media
//                         </Link>
//                     </Button>
//                 </div>
//             </div>

//             <Card>
//                 <CardHeader>
//                     <CardTitle>Product Details</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-2">
//                     <p>
//                         <span className="font-medium">Slug:</span>{" "}
//                         {product.slug}
//                     </p>
//                     <p>
//                         <span className="font-medium">Category:</span>{" "}
//                         {product.category?.name || "—"}
//                     </p>
//                     <p>
//                         <span className="font-medium">Status:</span>{" "}
//                         {product.status}
//                     </p>
//                     <p>
//                         <span className="font-medium">Tournament:</span>{" "}
//                         {product.tournamentTag || "—"}
//                     </p>
//                     {product.description && (
//                         <p>
//                             <span className="font-medium">Description:</span>{" "}
//                             {product.description}
//                         </p>
//                     )}
//                 </CardContent>
//             </Card>
//         </div>
//     );
// }


export default function ProductDetailsPage() {
    return <div>Product Details Page</div>;
}