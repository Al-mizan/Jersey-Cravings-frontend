import { Badge } from "@/components/ui/badge";
import { ProductStatus } from "@/types/product.types";

const STATUS_VARIANT_MAP: Record<ProductStatus, { variant: "default" | "destructive" | "secondary" | "outline"; label: string }> = {
    DRAFT: { variant: "outline", label: "Draft" },
    ACTIVE: { variant: "default", label: "Active" },
    ARCHIVED: { variant: "destructive", label: "Archived" },
};

interface IStatusBadgeCellProps {
    status: ProductStatus;
}

const StatusBadgeCell = ({ status }: IStatusBadgeCellProps) => {
    const config = STATUS_VARIANT_MAP[status];
    return (
        <Badge variant={config.variant}>
            <span className="text-sm">{config.label}</span>
        </Badge>
    );
};

export default StatusBadgeCell;