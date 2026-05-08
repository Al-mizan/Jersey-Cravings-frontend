// "use client";

// import React, { useState } from "react";
// import { useParams } from "next/navigation";
// import { useQuery } from "@tanstack/react-query";
// import { Button } from "@/components/ui/button";
// import {
//     Dialog,
//     DialogContent,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
// } from "@/components/ui/dialog";
// import VariantTable from "@/components/modules/Product/VariantTable";
// import VariantForm from "@/components/modules/Product/VariantForm";
// import { getProductVariants } from "@/services/product.service";
// import type { IProductVariant } from "@/types/product.types";
// import { Plus } from "lucide-react";

// export default function ProductVariantsPage() {
//     const params = useParams<{ id: string }>();
//     const [selectedVariant, setSelectedVariant] =
//         useState<IProductVariant | null>(null);
//     const [isDialogOpen, setIsDialogOpen] = useState(false);

//     const { data, isLoading, refetch } = useQuery({
//         queryKey: ["variants", params.id],
//         queryFn: () => getProductVariants(params.id, undefined, 1, 50),
//         staleTime: 30000,
//     });

//     return (
//         <div className="space-y-6">
//             <div className="flex items-center justify-between">
//                 <div>
//                     <h1 className="text-3xl font-bold tracking-tight">
//                         Product Variants
//                     </h1>
//                     <p className="text-muted-foreground mt-1">
//                         Manage inventory and pricing for this product.
//                     </p>
//                 </div>
//                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//                     <DialogTrigger asChild>
//                         <Button onClick={() => setSelectedVariant(null)}>
//                             <Plus className="h-4 w-4 mr-2" />
//                             Add Variant
//                         </Button>
//                     </DialogTrigger>
//                     <DialogContent className="max-w-lg">
//                         <DialogHeader>
//                             <DialogTitle>
//                                 {selectedVariant
//                                     ? "Edit Variant"
//                                     : "Create Variant"}
//                             </DialogTitle>
//                         </DialogHeader>
//                         <VariantForm
//                             productId={params.id}
//                             initialVariant={selectedVariant || undefined}
//                             onSuccess={() => {
//                                 setIsDialogOpen(false);
//                                 refetch();
//                             }}
//                             onCancel={() => setIsDialogOpen(false)}
//                         />
//                     </DialogContent>
//                 </Dialog>
//             </div>

//             <VariantTable
//                 variants={data?.data || null}
//                 isLoading={isLoading}
//                 onEdit={(variant) => {
//                     setSelectedVariant(variant);
//                     setIsDialogOpen(true);
//                 }}
//                 onDelete={() => {
//                     // TODO: implement delete variant confirmation
//                 }}
//             />
//         </div>
//     );
// }


export default function ProductVariantsPage() {
    return <div>Product Variants Page</div>;
}