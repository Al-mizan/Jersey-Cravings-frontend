import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProductById } from "@/services/product.service";

interface ProductDetailsPageProps {
    params: Promise<{ id: string }>;
}

export default async function ProductDetailsPage({
    params,
}: ProductDetailsPageProps) {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
        return (
            <div className="space-y-4">
                <h1 className="text-2xl font-semibold">Product not found</h1>
                <Button asChild variant="outline">
                    <Link href="/admin/products">Back to products</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">{product.title}</h1>
                    <p className="text-sm text-muted-foreground">
                        {product.teamName} • {product.jerseyType}
                    </p>
                </div>
                <Badge variant="outline">{product.status}</Badge>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Product Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm">
                    <p>
                        <span className="font-medium">Slug:</span> {product.slug}
                    </p>
                    <p>
                        <span className="font-medium">Category:</span>{" "}
                        {product.category?.name ?? "N/A"}
                    </p>
                    <p>
                        <span className="font-medium">Tournament:</span>{" "}
                        {product.tournamentTag ?? "N/A"}
                    </p>
                    <p>
                        <span className="font-medium">Variants:</span>{" "}
                        {product.variants?.length ?? 0}
                    </p>
                    <p>
                        <span className="font-medium">Media:</span>{" "}
                        {product.media?.length ?? 0}
                    </p>
                    {product.description ? (
                        <p>
                            <span className="font-medium">Description:</span>{" "}
                            {product.description}
                        </p>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
}