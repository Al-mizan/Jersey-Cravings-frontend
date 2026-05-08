import { Badge } from "@/components/ui/badge";
import type { ProductStatus } from "@/types/product.types";

interface ProductInfoCellProps {
    title: string;
    slug: string;
    teamName: string;
    status: ProductStatus;
}

const statusTone: Record<ProductStatus, string> = {
    DRAFT: "bg-amber-500/10 text-amber-700 border-amber-500/25",
    ACTIVE: "bg-emerald-500/10 text-emerald-700 border-emerald-500/25",
    ARCHIVED: "bg-slate-500/10 text-slate-700 border-slate-500/25",
};

export default function ProductInfoCell({
    title,
    slug,
    teamName,
    status,
}: ProductInfoCellProps) {
    return (
        <div className="space-y-1">
            <div className="font-medium">{title}</div>
            <div className="text-xs text-muted-foreground">
                {teamName} • {slug}
            </div>
            <Badge variant="outline" className={statusTone[status]}>
                {status}
            </Badge>
        </div>
    );
}
